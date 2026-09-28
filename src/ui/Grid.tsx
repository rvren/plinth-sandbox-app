import type { ReactNode } from "react";
import type { Space } from "./tone";

export interface GridProps {
  /** 1–6 equal columns. */
  columns?: number;
  gap?: Space;
  children?: ReactNode;
}

export const Grid = ({ columns = 2, gap = 4, children }: GridProps) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${Math.max(1, Math.min(columns, 6))}, minmax(0, 1fr))`,
      gap: `var(--space-${gap})`,
    }}
  >
    {children}
  </div>
);
