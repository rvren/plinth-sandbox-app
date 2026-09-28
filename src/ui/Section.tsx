import type { ReactNode } from "react";

export interface SectionProps {
  title: string;
  description?: string;
  collapsed?: boolean;
  children?: ReactNode;
}

export const Section = ({ title, description, collapsed = false, children }: SectionProps) => (
  <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
    <h2 style={{ margin: 0, fontSize: 15, letterSpacing: 0.2 }}>{title}</h2>
    {description ? <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>{description}</p> : null}
    {collapsed ? null : children}
  </section>
);
