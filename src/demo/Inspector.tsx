"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { usePlinth } from "@plinth/sdk-react";
import { egressLog, type EgressEntry } from "../plinth/egress-log";
import { isOptedOut, setOptOut } from "../plinth/transport";
import { useDemo } from "./DemoContext";

/**
 * The demo inspector — NOT part of the SDK and not something Meridian would ship.
 *
 * It makes the invisible parts of the loop visible from the end user's side: which config
 * the page is rendering with, whether a newer one is waiting, and every byte the SDK sent.
 */

const panel: CSSProperties = {
  position: "fixed",
  right: 16,
  bottom: 16,
  width: 380,
  maxHeight: "70vh",
  overflow: "auto",
  background: "#0f131b",
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
  fontSize: 12,
  zIndex: 50,
};
const button: CSSProperties = {
  fontSize: 12,
  padding: "4px 10px",
  borderRadius: 6,
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-raised)",
  color: "var(--color-text)",
  cursor: "pointer",
};
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "3px 0" }}>
    <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
    <span style={{ textAlign: "right" }}>{children}</span>
  </div>
);
const Heading = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--color-text-muted)", margin: "10px 0 4px" }}>
    {children}
  </div>
);

export const Inspector = () => {
  const plinth = usePlinth();
  const demo = useDemo();
  const [open, setOpen] = useState(true);
  const [entries, setEntries] = useState<readonly EgressEntry[]>([]);
  const [optedOut, setOptedOutState] = useState(false);
  const [lastFlush, setLastFlush] = useState<string | null>(null);

  useEffect(() => egressLog.subscribe(setEntries), []);
  useEffect(() => setOptedOutState(isOptedOut()), []);

  const config = plinth.active.config;
  const rules = config?.policy?.rules.length ?? 0;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={{ ...button, position: "fixed", right: 16, bottom: 16, zIndex: 50 }}>
        plinth inspector
      </button>
    );
  }

  return (
    <aside aria-label="plinth demo inspector" style={panel}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 12px",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          background: "#0f131b",
        }}
      >
        <strong style={{ fontSize: 12 }}>plinth inspector</strong>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>demo only</span>
          <button type="button" onClick={() => setOpen(false)} style={{ ...button, padding: "2px 8px" }} aria-label="Close inspector">
            ×
          </button>
        </span>
      </div>

      <div style={{ padding: "4px 12px 12px" }}>
        <Heading>Config this page renders with</Heading>
        <Row label="Tenant">{demo.tenant.label}</Row>
        <Row label="Source">
          {plinth.active.origin === "network"
            ? "verified, from the API"
            : plinth.active.origin === "cache"
              ? "verified, from device cache"
              : "none — original UI"}
        </Row>
        <Row label="Rules">{config ? `${rules} (signed)` : "—"}</Row>
        <Row label="Kill switch">
          <span style={{ color: config?.killSwitch ? "var(--color-critical)" : undefined }}>{config?.killSwitch ? "ON" : "off"}</span>
        </Row>
        {plinth.pendingUpdate ? (
          <div
            style={{
              marginTop: 8,
              padding: 8,
              borderRadius: 6,
              border: "1px solid var(--color-accent)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>A newer config is verified. It applies on the next navigation — never mid-view.</span>
            <button type="button" onClick={plinth.applyUpdate} style={button}>
              Apply now
            </button>
          </div>
        ) : null}
        <div style={{ marginTop: 8 }}>
          <button type="button" onClick={() => void plinth.refresh()} style={button}>
            Check for an update
          </button>
        </div>

        <Heading>Heatmap reporting</Heading>
        <Row label="Demo clock">{demo.clockOffsetDays === 0 ? "real time" : `+${demo.clockOffsetDays} days`}</Row>
        <Row label="Opted out">{optedOut ? "yes — nothing is sent" : "no"}</Row>
        <p style={{ margin: "6px 0", color: "var(--color-text-muted)" }}>
          Clicks are kept on this device. After a week ends, one noised report about one randomly chosen screen is sent.
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            type="button"
            style={button}
            onClick={() => {
              demo.fastForward(7);
              setLastFlush("clock moved a week — last week’s report is sent if due (see below)");
            }}
          >
            Fast-forward a week
          </button>
          <button type="button" style={button} onClick={async () => setLastFlush(await plinth.flush())}>
            Send due report
          </button>
          <button
            type="button"
            style={button}
            onClick={() => {
              setOptOut(!optedOut);
              setOptedOutState(!optedOut);
            }}
          >
            {optedOut ? "Opt back in" : "Opt out"}
          </button>
        </div>
        {lastFlush ? <p style={{ margin: "6px 0 0", color: "var(--color-text-muted)" }}>Last send: {lastFlush}</p> : null}

        <Heading>What left this browser ({entries.length})</Heading>
        {entries.length === 0 ? (
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>Nothing yet.</p>
        ) : (
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            {entries.map((entry) => (
              <li key={entry.id} style={{ borderTop: "1px solid var(--color-border)", paddingTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <code style={{ fontFamily: "var(--font-mono)" }}>
                    {entry.method} {entry.path}
                  </code>
                  <span style={{ color: "var(--color-text-muted)" }}>{new Date(entry.at).toLocaleTimeString()}</span>
                </div>
                <div style={{ color: "var(--color-text-muted)" }}>
                  {entry.outcome}
                  {entry.bytes ? ` · ${entry.bytes} bytes` : ""}
                </div>
                {entry.body ? (
                  <details>
                    <summary style={{ cursor: "pointer", color: "var(--color-accent)" }}>Body — integers and bits only</summary>
                    <pre
                      style={{
                        margin: "4px 0 0",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--color-text-muted)",
                        maxHeight: 140,
                        overflow: "auto",
                      }}
                    >
                      {entry.body}
                    </pre>
                  </details>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
};
