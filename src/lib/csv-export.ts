export interface CsvColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => string | number;
}

export function exportToCsv<T>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string
) {
  const headerRow = columns.map((col) => col.header).join(",");

  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const value = col.render
          ? col.render(row)
          : (row as Record<string, unknown>)[col.key as string];
        const str = String(value ?? "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );

  const csvContent = [headerRow, ...dataRows].join("\r\n");
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
