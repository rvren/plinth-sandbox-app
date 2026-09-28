import { toneColor, type Tone } from "./tone";

export interface MetricProps {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  tone?: Tone;
}

export const Metric = ({ label, value, unit, delta, tone }: MetricProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
    <span style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
      {label}
    </span>
    <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      {unit ? <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{unit}</span> : null}
    </span>
    {delta ? <span style={{ fontSize: 11, color: toneColor(tone) }}>{delta}</span> : null}
  </div>
);
