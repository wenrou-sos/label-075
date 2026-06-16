"use client";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T, index: number) => React.ReactNode;
  emptyText?: string;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  actions,
  emptyText = "暂无数据",
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-border ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-text-secondary whitespace-nowrap ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 text-left font-medium text-text-secondary whitespace-nowrap">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-4 py-12 text-center text-text-muted"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b border-border last:border-b-0 transition-colors ${
                  rowIndex % 2 === 1 ? "bg-bg/50" : ""
                } hover:bg-accent/5`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-text whitespace-nowrap ${col.className || ""}`}
                  >
                    {col.render
                      ? col.render(row, rowIndex)
                      : ((row as Record<string, unknown>)[col.key] as React.ReactNode) ?? "-"}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    {actions(row, rowIndex)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
