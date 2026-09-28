import type { ReactNode } from "react";
import { toneColor, type Tone } from "./tone";

export interface CardProps {
  title?: string;
  subtitle?: string;
  tone?: Tone;
  children?: ReactNode;
}

export const Card = ({ title, subtitle, tone, children }: CardProps) => (
  <section
    style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-4)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      minWidth: 0,
    }}
  >
    {title ? <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: toneColor(tone) }}>{title}</h3> : null}
    {subtitle ? <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>{subtitle}</p> : null}
    {children}
  </section>
);
