export interface ListProps {
  items: string[];
  emptyText?: string;
}

export const List = ({ items, emptyText = "Nothing to show." }: ListProps) =>
  items.length === 0 ? (
    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>{emptyText}</p>
  ) : (
    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
      {items.slice(0, 50).map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
