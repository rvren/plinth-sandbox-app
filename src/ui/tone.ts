/** The colour roles Meridian's components accept. Anything else renders as default text. */
export type Tone = "default" | "muted" | "accent" | "positive" | "warning" | "critical";

export const toneColor = (tone: Tone | undefined): string => {
  switch (tone) {
    case "positive":
      return "var(--color-positive)";
    case "warning":
      return "var(--color-warning)";
    case "critical":
      return "var(--color-critical)";
    case "accent":
      return "var(--color-accent)";
    case "muted":
      return "var(--color-text-muted)";
    default:
      return "var(--color-text)";
  }
};

export type Space = 1 | 2 | 3 | 4 | 6;
