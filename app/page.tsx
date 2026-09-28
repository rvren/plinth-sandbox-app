"use client";

import { useState } from "react";
import { explain } from "@plinth/policy-engine";
import { AdaptiveRegion, type ResolvedRegion } from "@plinth/sdk-react";
import { defaultDashboard, meridianCatalog, specCapabilities } from "../src/catalog/specs";
import { PERSONAS, useDemo } from "../src/demo/DemoContext";

/**
 * Meridian's dashboard. The region below is composed by the policy the console signs:
 * the vendor's persona rules, plus any change the vendor approved from real usage.
 *
 * `control` is what Meridian ships — the order its designers authored. It is what renders
 * before any config exists, whenever no rule applies, and whenever anything goes wrong.
 */

const CONTROL = defaultDashboard.map((spec) => `item:${spec.id}`);

const defaultReason = (resolved: ResolvedRegion): string => {
  const reasons = resolved.trace.rejected.map((r) => r.reason);
  if (reasons.includes("kill switch")) return "kill switch on";
  if (reasons.includes("no config")) return "no config yet";
  if (reasons.some((r) => r.startsWith("outside rollout"))) return "an approved change exists, but this organization is not in its pilot";
  return "no rule applies";
};

export default function Dashboard() {
  const demo = useDemo();
  const [resolved, setResolved] = useState<ResolvedRegion | null>(null);
  const [showTrace, setShowTrace] = useState(false);

  const shown = new Set(resolved?.trace.specIds.map((id) => id.replace(/^item:/, "")) ?? []);
  const hidden = meridianCatalog.filter((spec) => !shown.has(spec.id));
  const discovered = resolved?.trace.specIds
    .map((id) => id.replace(/^item:/, ""))
    .filter((id) => !demo.facts.usedCapabilities.includes(specCapabilities[id] ?? ""));
  const rule = resolved?.trace.ruleId;

  return (
    <div style={{ padding: "var(--space-2)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Dashboard</h1>
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{demo.tenant.label}</span>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div role="group" aria-label="Viewing as" data-plinth-key="persona-switch" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Viewing as</span>
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => demo.setPersona(p.id)}
                aria-pressed={p.id === demo.persona}
                style={{
                  fontSize: 12,
                  padding: "5px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  border: `1px solid ${p.id === demo.persona ? "var(--color-accent)" : "var(--color-border)"}`,
                  background: p.id === demo.persona ? "var(--color-surface-raised)" : "transparent",
                  color: p.id === demo.persona ? "var(--color-text)" : "var(--color-text-muted)",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            data-plinth-key="why-layout"
            onClick={() => setShowTrace((v) => !v)}
            style={{
              fontSize: 12,
              padding: "5px 10px",
              borderRadius: 6,
              cursor: "pointer",
              border: "1px solid var(--color-border)",
              background: "transparent",
              color: "var(--color-text-muted)",
              marginLeft: "auto",
            }}
          >
            {showTrace ? "Hide" : "Why this layout?"}
          </button>
        </div>

        {resolved ? (
          <div
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-3)",
              background: "var(--color-surface)",
              fontSize: 12,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span>
              {rule ? (
                <>
                  Rule <code style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>{rule}</code> · approved by{" "}
                  {resolved.trace.approvedBy}
                </>
              ) : (
                <>Meridian&apos;s default layout ({defaultReason(resolved)})</>
              )}{" "}
              · {resolved.trace.specIds.length} panels · {hidden.length} hidden · ceiling {resolved.trace.ceiling}
            </span>
            {rule && discovered && discovered.length > 0 && demo.persona !== "everyone" ? (
              <span style={{ color: "var(--color-positive)" }}>
                Surfaced {discovered.length} panel{discovered.length === 1 ? "" : "s"} for capabilities this user has never invoked.
              </span>
            ) : null}
            {showTrace ? (
              <pre
                style={{
                  margin: 0,
                  padding: "var(--space-3)",
                  background: "var(--color-bg)",
                  borderRadius: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  whiteSpace: "pre-wrap",
                  overflowX: "auto",
                }}
              >
                {explain(resolved.trace)}
              </pre>
            ) : null}
          </div>
        ) : null}
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "var(--space-4)",
          alignItems: "start",
        }}
      >
        <AdaptiveRegion surface="dashboard.primary" control={CONTROL} onResolved={setResolved} />
      </section>

      <footer style={{ fontSize: 11, color: "var(--color-text-muted)", display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span>{resolved?.plans.length ?? 0} panels rendered</span>
        <span>{resolved?.degraded ? "DEGRADED — serving Meridian's default" : "healthy"}</span>
        <span>Meridian is a synthetic product. Every value is invented.</span>
      </footer>
    </div>
  );
}
