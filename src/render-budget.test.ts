import { describe, expect, it } from "vitest";
import { ComponentSpec, TenantPolicy, UserFacts, lit, ref } from "@plinth/contract";
import { MAX_ROWS } from "@plinth/renderer";
import { resolveRegion } from "@plinth/sdk-react";
import { defaultDashboard, meridianCatalog } from "./catalog/specs.js";
import { meridianData } from "./platform/data.js";

/**
 * Render-cost budget: the SDK must not cost a Core Web Vital.
 *
 * Budget: 2 ms per region on a mid-tier device, modelled as 4× slower than the REFERENCE
 * machine (an Apple M-series laptop) — i.e. 0.5 ms per region on the reference machine.
 * Measured at p95 after warm-up, because INP is judged at the tail, not the mean.
 *
 * CALIBRATED to the machine running the test. The first version applied the 4× factor to
 * whatever machine ran it, so on a CI runner already ~3× slower than the reference it demanded
 * 12× headroom and flaked (0.52 ms against 0.5 ms). Now a fixed reference workload is timed
 * first and the budget scales with this machine's measured speed: a slow runner gets a
 * proportionally larger allowance, while a genuine regression — which slows the code, not the
 * machine — still fails everywhere.
 *
 * Two cases. The real dashboard shows typical cost. The worst case is a table at the
 * renderer's row cap: the most work any spec can make the SDK do, so the budget holds for
 * anything a model could ever generate. On the reference machine: ~0.006 ms per dashboard
 * region and ~0.16 ms for the worst case (1.67 ms before Intl formatters were memoized).
 */

const CPU_SLOWDOWN = 4;
const BUDGET_ON_REFERENCE_MS = 2 / CPU_SLOWDOWN;
/** Median time of `referenceWork` on the reference machine (measured 0.496–0.508 ms). */
const REFERENCE_WORK_MS = 0.5;
const WARMUP = 300;
const RUNS = 3000;
const TRIALS = 3;

/** Allocation, string building and property access — the kinds of work plan-building does. */
const referenceWork = (): number => {
  let acc = 0;
  const parts: string[] = [];
  for (let i = 0; i < 20_000; i += 1) {
    const o = { a: i, b: `row-${i}`, c: { d: i % 13 } };
    parts.push(o.b.toUpperCase());
    acc += (o.a % 7) + o.c.d;
  }
  return acc + parts.join("").length;
};

/**
 * Best result of several trials. Noise on a shared runner (GC, a busy neighbour) only ever
 * makes a trial slower, never faster, so the minimum is the honest estimate of cost.
 */
const bestOf = (fn: () => unknown, quantile: number, runs = RUNS): number => {
  for (let i = 0; i < WARMUP; i += 1) fn();
  let best = Number.POSITIVE_INFINITY;
  for (let trial = 0; trial < TRIALS; trial += 1) {
    const samples: number[] = [];
    for (let i = 0; i < runs; i += 1) {
      const start = performance.now();
      fn();
      samples.push(performance.now() - start);
    }
    samples.sort((a, b) => a - b);
    best = Math.min(best, samples[Math.floor(quantile * (samples.length - 1))] ?? Number.POSITIVE_INFINITY);
  }
  return best;
};

const p95 = (fn: () => void): number => bestOf(fn, 0.95);

/**
 * This machine's speed relative to the reference, clamped so a wildly anomalous calibration
 * (a throttled container, a debugger attached) cannot silently relax the gate into meaninglessness.
 */
const speedFactor = Math.min(8, Math.max(0.5, bestOf(referenceWork, 0.5, 200) / REFERENCE_WORK_MS));
const BUDGET_MS_PER_REGION = BUDGET_ON_REFERENCE_MS * speedFactor;

const NOW = new Date("2026-06-15T12:00:00.000Z");
const facts = UserFacts.parse({ sessionCount: 3, daysSinceFirstSeen: 5, usedCapabilities: [], touchedKeys: [] });
const policy = TenantPolicy.parse({
  vendorId: "meridian",
  tenantId: "northwind",
  rules: [],
  updatedAt: "2026-06-01T00:00:00.000Z",
});

describe("render budget (Core Web Vitals: INP)", () => {
  it(`resolves and plans the real dashboard within budget (2 ms/region on a mid-tier device, calibrated)`, () => {
    const catalog = new Map(meridianCatalog.map((s) => [s.id, s]));
    const control = defaultDashboard.map((s) => s.id);
    const cost = p95(() => {
      resolveRegion({ policy, surface: "dashboard.primary", facts, catalog, control, data: meridianData, now: NOW });
    });
    const perRegion = cost / control.length;
    expect(perRegion, `p95 ${perRegion.toFixed(3)} ms per region; budget ${BUDGET_MS_PER_REGION.toFixed(3)} ms at speed ×${speedFactor.toFixed(2)}`).toBeLessThan(BUDGET_MS_PER_REGION);
  });

  it(`holds the budget for the worst case a spec can express: a ${MAX_ROWS}-row table`, () => {
    const columns = ["id", "lane", "carrier", "margin"];
    const worst = ComponentSpec.parse({
      specVersion: 1,
      id: "worst-case-table",
      title: "Worst case",
      level: "L2",
      origin: "catalog",
      dataContract: { reads: ["rows"] },
      root: {
        primitive: "Table",
        key: "wc",
        props: { rows: ref("rows"), emptyText: lit("None") },
        children: columns.map((c) => ({
          primitive: "TableColumn",
          key: `wc-${c}`,
          props: {
            header: lit(c),
            value: c === "margin" ? { kind: "fmt", fn: "percent", args: [ref(c)] } : ref(c),
          },
        })),
      },
    });
    const rows = Array.from({ length: MAX_ROWS * 2 }, (_, i) => ({
      id: `LKS-${i}`,
      lane: `Lane ${i}`,
      carrier: `Carrier ${i % 7}`,
      margin: (i % 30) / 100,
    }));
    const cost = p95(() => {
      resolveRegion({
        policy,
        surface: "any",
        facts,
        catalog: new Map([[worst.id, worst]]),
        control: [worst.id],
        data: { rows },
        now: NOW,
      });
    });
    expect(cost, `p95 ${cost.toFixed(3)} ms for one ${MAX_ROWS}-row table; budget ${BUDGET_MS_PER_REGION.toFixed(3)} ms at speed ×${speedFactor.toFixed(2)}`).toBeLessThan(BUDGET_MS_PER_REGION);
  });
});
