export interface EmptyStateProps {
  title: string;
  body?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, body, actionText, onAction }: EmptyStateProps) => (
  <div style={{ padding: "var(--space-6)", textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
    <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
    {body ? <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{body}</span> : null}
    {actionText && onAction ? (
      <div>
        <button
          type="button"
          onClick={onAction}
          style={{
            fontSize: 12,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid var(--color-accent)",
            background: "transparent",
            color: "var(--color-accent)",
            cursor: "pointer",
          }}
        >
          {actionText}
        </button>
      </div>
    ) : null}
  </div>
);
