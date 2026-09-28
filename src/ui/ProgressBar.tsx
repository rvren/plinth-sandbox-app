import { toneColor, type Tone } from "./tone";

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  tone?: Tone;
}

export const ProgressBar = ({ value, max = 100, label, tone }: ProgressBarProps) => {
  const pct = Math.max(0, Math.min(((Number.isFinite(value) ? value : 0) / (max || 100)) * 100, 100));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label ? <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{label}</span> : null}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
        style={{ height: 6, background: "var(--color-surface-raised)", borderRadius: 999 }}
      >
        <div style={{ width: `${pct}%`, height: "100%", background: toneColor(tone), borderRadius: 999 }} />
      </div>
    </div>
  );
};
