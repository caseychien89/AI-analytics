import { useState } from "react";
import { Search, Sheet, ArrowUpDown } from "lucide-react";

interface CSVTableProps {
  headers: string[];
  rows: Record<string, string | number>[];
}

export default function CSVTable({ headers, rows }: CSVTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 1. 全文搜尋過濾
  const filteredRows = rows.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 2. 排序
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const valA = a[key];
    const valB = b[key];

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (typeof valA === "number" && typeof valB === "number") {
      return direction === "asc" ? valA - valB : valB - valA;
    }

    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();
    return direction === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      {/* 頂部搜尋欄 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Sheet className="w-5 h-5 text-slate-500" />
          <span className="font-semibold text-slate-800 text-sm">數據表格瀏覽 ({filteredRows.length} 筆)</span>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋表格內容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-slate-300 transition-colors"
          />
        </div>
      </div>

      {/* 資料表格 */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        {sortedRows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">沒有匹配的數據 record</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/70 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    onClick={() => handleSort(h)}
                    className="px-6 py-3 cursor-pointer hover:bg-slate-200/50 hover:text-slate-800 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5 justify-start">
                      {h}
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50/70 transition-colors">
                  {headers.map((header) => {
                    const value = row[header];
                    const isNumber = typeof value === "number";
                    return (
                      <td
                        key={header}
                        className={`px-6 py-3.5 text-slate-700 font-sans ${
                          isNumber ? "font-medium text-slate-900" : ""
                        }`}
                      >
                        {value === undefined || value === null ? "-" : String(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
