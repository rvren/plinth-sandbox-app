export interface ButtonProps {
  text: string;
  variant?: "default" | "outline";
  disabled?: boolean;
  onClick?: () => void;
}

export const Button = ({ text, variant = "default", disabled = false, onClick }: ButtonProps) => {
  const inert = disabled || !onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={inert}
      style={{
        fontSize: 12,
        padding: "6px 12px",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${variant === "outline" ? "var(--color-accent)" : "var(--color-border)"}`,
        background: variant === "outline" || inert ? "transparent" : "var(--color-surface-raised)",
        color: inert ? "var(--color-text-muted)" : variant === "outline" ? "var(--color-accent)" : "var(--color-text)",
        cursor: inert ? "not-allowed" : "pointer",
        alignSelf: "flex-start",
      }}
    >
      {text}
    </button>
  );
};
