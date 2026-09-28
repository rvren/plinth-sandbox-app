import type { ReactNode } from "react";
import type { Space } from "./tone";

export interface StackProps {
  direction?: "row" | "column";
  gap?: Space;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  wrap?: boolean;
  children?: ReactNode;
}

export const Stack = ({ direction = "column", gap = 3, align, wrap = false, children }: StackProps) => (
  <div
    style={{
      display: "flex",
      flexDirection: direction,
      gap: `var(--space-${gap})`,
      alignItems: align,
      flexWrap: wrap ? "wrap" : undefined,
    }}
  >
    {children}
  </div>
);
