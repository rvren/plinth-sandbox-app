import type { ReactNode } from "react";

export interface DataTableProps {
  /** Header cells (<th>), already rendered. */
  header: ReactNode;
  /** One array of <td> cells per row. */
  rows: ReactNode[];
  emptyText?: string;
}

export const DataTable = ({ header, rows, emptyText = "No rows." }: DataTableProps) =>
  rows.length === 0 ? (
    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>{emptyText}</p>
  ) : (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>{header}</tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} style={{ borderTop: "1px solid var(--color-border)" }}>
              {cells}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

export interface ColumnCellProps {
  text: string;
  align?: "left" | "right";
  header?: boolean;
}

export const ColumnCell = ({ text, align = "left", header = false }: ColumnCellProps) =>
  header ? (
    <th scope="col" style={{ textAlign: align, padding: "6px 8px", fontSize: 11, color: "var(--color-text-muted)", fontWeight: 500 }}>
      {text}
    </th>
  ) : (
    <td style={{ padding: "6px 8px", textAlign: align, fontVariantNumeric: "tabular-nums" }}>{text}</td>
  );
