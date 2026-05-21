import { HistoryItem } from "../types";
import { History, Trash2, Calendar, FileSpreadsheet, Eye } from "lucide-react";

interface HistorySidebarProps {
  items: HistoryItem[];
  selectedId: string | null;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function HistorySidebar({
  items,
  selectedId,
  onSelect,
  onDelete,
  onClearAll
}: HistorySidebarProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800">
          <History className="w-5 h-5 text-slate-500" />
          <span className="font-semibold text-sm">歷史分析紀錄</span>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
          >
            清除全部
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          暫無分析歷史。上傳數據開始您的第一次 AI 探索！
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
          {items.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                className={`group relative flex items-start justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/70 border-blue-200 text-blue-900"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100/50 hover:border-slate-200"
                }`}
                onClick={() => onSelect(item)}
              >
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.timestamp).toLocaleString("zh-TW", { hour12: false })}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-700 truncate group-hover:text-slate-900">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                    <FileSpreadsheet className="w-3 h-3 text-slate-400" />
                    <span>大小：{item.csvSize}</span>
                  </div>
                </div>

                <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-white border border-slate-100 shadow-sm transition-colors cursor-pointer"
                    title="刪除紀錄"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="p-1 rounded-md bg-white text-slate-500 border border-slate-100 shadow-sm">
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
