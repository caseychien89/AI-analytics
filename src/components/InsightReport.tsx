import { useState } from "react";
import Markdown from "react-markdown";
import { Copy, Check, FileText } from "lucide-react";

interface InsightReportProps {
  insights: string;
}

export default function InsightReport({ insights }: InsightReportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(insights);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("無法複製文字:", err);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      {/* 標題欄 */}
      <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800">
          <FileText className="w-5 h-5 text-slate-500" />
          <span className="font-semibold text-base">深度商業分析報告</span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 shadow-xs transition-colors hover:bg-slate-50 active:bg-slate-100 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">已複製！</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>複製報告</span>
            </>
          )}
        </button>
      </div>

      {/* 報告內文區 (套用自訂 Markdown 樣式) */}
      <div className="p-6 md:p-8 max-h-[600px] overflow-y-auto">
        <div className="markdown-body prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm">
          <Markdown>{insights}</Markdown>
        </div>
      </div>
    </div>
  );
}
