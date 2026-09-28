import { describe, expect, it } from "vitest";
import { buildPlan, planText } from "@plinth/renderer";
import { checkSpec } from "@plinth/guardrails";
import { defaultDashboard, meridianCatalog, specCapabilities } from "./specs.js";
import { meridianCapabilities, meridianData, PERSONAS } from "../platform/data.js";
import { meridianDesignSystem } from "../design-system/tokens.js";

/**
 * The catalog is executable documentation.
 *
 * Every spec is rendered against the real fixture data, so a spec that drifts from the
 * data contract fails CI rather than in front of a user. This is also the closest thing
 * to a fidelity check available before there is a browser in the loop.
 */

const NOW = new Date("2026-06-15T12:00:00.000Z");
const plans = meridianCatalog.map((spec) => ({ spec, plan: buildPlan(spec, { data: meridianData, now: NOW }) }));

describe("Meridian catalog", () => {
  it("renders every spec without rejection", () => {
    // buildPlan throws on rejection, so reaching here at all is the assertion; the count
    // guards against the catalog silently shrinking.
    expect(plans).toHaveLength(meridianCatalog.length);
    expect(plans.length).toBeGreaterThanOrEqual(10);
  });

  it("resolves every declared read against the fixture data", () => {
    for (const { spec, plan } of plans) {
      const unresolved = plan.warnings.filter((w) => w.startsWith("unresolved path"));
      expect(unresolved, `${spec.id}: ${unresolved.join(", ")}`).toEqual([]);
    }
  });

  it("binds a vendor component for every primitive the catalog uses", () => {
    const bound = new Set(meridianDesignSystem.bindings.map((b) => b.primitive));
    const used = new Set<string>();
    const walk = (node: { primitive: string; children: { primitive: string; children: unknown[] }[] }): void => {
      used.add(node.primitive);
      for (const child of node.children) walk(child as never);
    };
    for (const { plan } of plans) walk(plan.root as never);
    for (const primitive of used) {
      expect(bound.has(primitive as never), `no binding for ${primitive}`).toBe(true);
    }
  });

  it("assigns stable keys, which positional constancy will depend on", () => {
    for (const { spec, plan } of plans) {
      const keyed = plan.keys.filter((k) => !k.startsWith("root"));
      expect(keyed.length, `${spec.id} has no explicit keys`).toBeGreaterThan(0);
    }
    const all = plans.flatMap(({ plan }) => plan.keys.filter((k) => !k.startsWith("root")));
    expect(new Set(all).size, "keys must be unique across the catalog").toBe(all.length);
  });

  it("formats currency, percent and duration through the pinned locale", () => {
    const spend = plans.find((p) => p.spec.id === "spend-summary");
    const mtd = spend?.plan.root.children[0]?.children[0]?.props.value;
    expect(planText(mtd)).toBe("$148,320.00");

    const gpu = plans.find((p) => p.spec.id === "gpu-utilization");
    expect(planText(gpu?.plan.root.children[0]?.props.value)).toBe("61%");

    const training = plans.find((p) => p.spec.id === "training-runs");
    const wait = training?.plan.root.children[0]?.children[2]?.props.value;
    expect(planText(wait)).toBe("38m 0s");
  });

  it("evaluates conditional tone locally — over-budget forecast reads as critical", () => {
    const forecast = plans.find((p) => p.spec.id === "budget-forecast");
    const metric = forecast?.plan.root.children[0]?.props;
    // Fixture forecast (203,900) exceeds budget (180,000), so the spec's conditional fires.
    expect(planText(metric?.delta)).toBe("Over budget");
    expect(planText(metric?.tone)).toBe("critical");
  });
});

describe("the fixture's deliberate flaws are still present", () => {
  /**
   * These assertions protect the demo. If someone "fixes" the fixture, the persona audit
   * has nothing to find and the Foundry demo loses its subject — so the flaws are pinned
   * as requirements.
   */
  it("still has a dead-end empty state in Reports", () => {
    expect(meridianData.reports.saved).toHaveLength(0);
    const reports = plans.find((p) => p.spec.id === "saved-reports");
    expect(reports).toBeDefined();
    const table = reports?.plan.root.children[0];
    expect(planText(table?.props.emptyText)).toBe("No saved reports.");
  });

  it("still has an Export button disabled with no explanation", () => {
    const reports = plans.find((p) => p.spec.id === "saved-reports");
    const button = reports?.plan.root.children[1];
    expect(button?.primitive).toBe("Button");
    expect(button?.props.disabled).toBe(true);
    // No tooltip, no reason, no action — precisely what generates rage-clicks.
    expect(button?.action).toBeUndefined();
  });

  it("still ships capabilities that no panel surfaces", () => {
    const surfaced = new Set(Object.values(specCapabilities));
    const buried = meridianCapabilities.capabilities
      .filter((c) => !surfaced.has(c.id))
      .map((c) => c.id);
    // cluster.rightsize and reports.export exist and appear in no catalog spec.
    expect(buried).toContain("cluster.rightsize");
    expect(buried.length).toBeGreaterThan(0);
  });

  it("keeps budget-forecast authored but off the default dashboard", () => {
    // A capability cannot be "surfaced nowhere" while sitting on the dashboard.
    expect(meridianCatalog.map((s) => s.id)).toContain("budget-forecast");
    expect(defaultDashboard.map((s) => s.id)).not.toContain("budget-forecast");
  });

  it("has a catalog where no persona wants everything", () => {
    // The premise the policy engine acts on: each persona needs a strict subset, so a
    // single composition is necessarily wrong for all three.
    for (const persona of PERSONAS) {
      const relevant = meridianCatalog.filter((spec) =>
        (persona.cares as readonly string[]).includes(specCapabilities[spec.id] ?? ""),
      );
      expect(relevant.length).toBeLessThan(meridianCatalog.length);
    }
  });
});

describe("Meridian catalog — its own gate", () => {
  /**
   * The vendor's hand-authored catalog must pass the same guardrails a generated spec
   * faces. ADR-010 found five that did not — every table (row-scoped refs judged as region
   * paths) and every `muted` tone (a normalization that matched neither spelling). A gate
   * the vendor's own components fail is a gate nobody trusts, so this is the canary.
   */
  it.each(meridianCatalog.map((s) => [s.id, s] as const))("%s passes checkSpec", (_id, spec) => {
    const report = checkSpec(spec, {
      ceiling: "L4",
      designSystem: meridianDesignSystem,
      allowedReads: new Set(spec.dataContract.reads),
    });
    const errors = report.findings.filter((f) => f.severity === "error").map((f) => `${f.rule}: ${f.message}`);
    expect(errors).toEqual([]);
  });
});
