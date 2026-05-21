import { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  Sparkles,
  Sheet,
  Database,
  History,
  FileSpreadsheet,
  HelpCircle,
  AlertCircle,
  TrendingUp,
  LineChart as LineIcon,
  MessageSquare,
  RefreshCw,
  Plus,
  Trash2,
  Play
} from "lucide-react";
import { parseCSV, SAMPLE_DATASETS, SampleDataset } from "./utils/csvParser";
import { AnalysisResult, HistoryItem } from "./types";
import MetricCard from "./components/MetricCard";
import AnalyticsChart from "./components/AnalyticsChart";
import InsightReport from "./components/InsightReport";
import RecommendationList from "./components/RecommendationList";
import CSVTable from "./components/CSVTable";
import HistorySidebar from "./components/HistorySidebar";

export default function App() {
  // 輸入資料與狀態
  const [csvText, setCsvText] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 解析後的 CSV 資料
  const [parsedCSV, setParsedCSV] = useState(() => parseCSV(""));

  // 伺服器 API 狀態
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean | null>(null);

  // 當前分析的結果與關聯 ID
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // 歷史紀錄
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // 拖放狀態
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 初始化讀取：確認 API 金鑰是否配置，載入歷史資料
  useEffect(() => {
    // 檢查 API 金鑰健康度
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setIsApiKeyConfigured(data.isApiKeyConfigured);
      })
      .catch((err) => {
        console.error("無法連接伺服器配置 API:", err);
        setIsApiKeyConfigured(false);
      });

    // 載入 localStorage 歷史資料
    const saved = localStorage.getItem("ai_databi_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistoryItems(parsed);
      } catch (err) {
        console.error("載入分析歷史失敗:", err);
      }
    }
  }, []);

  // 2. 當輸入 CSV 更改時，即時解析
  useEffect(() => {
    const result = parseCSV(csvText);
    setParsedCSV(result);
  }, [csvText]);

  // 3. 拖放上傳邏輯處理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setErrorMessage("請上傳有效的 .csv 格式報表檔案！");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setCsvText(text);
        setErrorMessage(null);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // 4. 套用範例數據庫
  const handleApplySample = (sample: SampleDataset) => {
    setCsvText(sample.csvData);
    setErrorMessage(null);
    // 自動生成一個適合該範例的自訂提示
    if (sample.id === "sales-report") {
      setCustomPrompt("請幫我找出銷售額最高與利潤率最差的地區，並分析主因與未來營收改進空間。");
    } else if (sample.id === "website-performance") {
      setCustomPrompt("分析哪個廣告通路的獲客回報率 (ROI) 最高？以及購物車流失的最可能因素。");
    } else {
      setCustomPrompt("請總結部門績效大局，列出並對比最高績效前三位的核心貢獻，並給予低分人員發展性建議。");
    }
  };

  // 5. 送出開始 AI 分析
  const handleAnalyze = async () => {
    if (!csvText.trim()) {
      setErrorMessage("請先貼上或拖曳上傳 CSV 報表數據！");
      return;
    }
    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvData: csvText,
          customPrompt: customPrompt.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "分析端點發生未知錯誤。");
      }

      // 分析結果
      const analysisResult: AnalysisResult = data;
      setActiveResult(analysisResult);

      // 產生一筆歷史紀錄
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        title: `數據分析 - ${parsedCSV.headers[0] ? `${parsedCSV.headers[0]}維度` : "自訂報表"} (${analysisResult.summary.totalRows} 筆)`,
        csvSize: `${(csvText.length / 1024).toFixed(2)} KB`,
        csvData: csvText,
        result: analysisResult
      };

      const updatedHistory = [newHistoryItem, ...historyItems];
      setHistoryItems(updatedHistory);
      localStorage.setItem("ai_databi_history", JSON.stringify(updatedHistory));
      setActiveHistoryId(newHistoryItem.id);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "嘗試與 AI 分析模型通訊時發生錯誤。請確認伺服器配置或稍後再試。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 6. 選擇歷史紀錄載入
  const handleSelectHistory = (item: HistoryItem) => {
    setCsvText(item.csvData);
    setActiveResult(item.result);
    setActiveHistoryId(item.id);
    setErrorMessage(null);
  };

  // 7. 刪除與清除歷史記錄
  const handleDeleteHistory = (id: string) => {
    const updated = historyItems.filter((h) => h.id !== id);
    setHistoryItems(updated);
    localStorage.setItem("ai_databi_history", JSON.stringify(updated));
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
      setActiveResult(null);
    }
  };

  const handleClearAllHistory = () => {
    if (confirm("確認要清除所有歷史分析紀錄嗎？此動作不可回復。")) {
      setHistoryItems([]);
      localStorage.removeItem("ai_databi_history");
      setActiveHistoryId(null);
      setActiveResult(null);
    }
  };

  // 8. 開啟新分析（清除目前看板，維持歷史紀錄）
  const handleNewAnalysis = () => {
    setCsvText("");
    setCustomPrompt("");
    setActiveResult(null);
    setActiveHistoryId(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white pb-16">
      
      {/* 頂部導航欄 */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">AI 數據分析與洞察工具</h1>
              <p className="text-xs text-slate-500 font-medium">基於 Gemini 智慧模型的一鍵式商業分析平台</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* API Key 狀態提示器 */}
            {isApiKeyConfigured === false && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>請至 Settings &gt; Secrets 設定 GEMINI_API_KEY</span>
              </div>
            )}
            {isApiKeyConfigured === true && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI 模型已連線</span>
              </div>
            )}
            
            <button
              onClick={handleNewAnalysis}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>開新分析</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主工作區群組 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* 主要警示訊息 */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs md:text-sm flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">操作錯誤或系統異常</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* 雙欄或單欄自適應排版 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 左欄：CSV 上傳與自訂提示面板 (佔 5 欄) */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* 上傳區塊卡片 */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  上傳報表數據
                </h2>
                <p className="text-xs text-slate-500">上傳您的 .csv 報表，或直接在此貼上 CSV 文本內容</p>
              </div>

              {/* 預設範例選擇器：幫助用戶快速測試 */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">
                  ⚡ 快速體驗：載入繁體中文精選範例
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {SAMPLE_DATASETS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleApplySample(sample)}
                      className="text-left p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-50/40 hover:border-blue-200 transition-all duration-200 group flex items-start gap-2.5 cursor-pointer"
                    >
                      <span className="p-1.5 bg-white rounded-lg border border-slate-200 group-hover:bg-blue-50">
                        <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-700 group-hover:text-blue-900">
                          {sample.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {sample.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 拖曳上傳/點擊 zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">拖曳 CSV 檔案至此，或點擊上傳</span>
                <span className="text-[10px] text-slate-400 mt-1">支援 UTF-8 編碼 .csv 報表</span>
              </div>

              {/* 貼上純文字 CSV 方塊 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">文字輸入區 (CSV 格式) :</span>
                  {csvText && (
                    <button
                      onClick={() => setCsvText("")}
                      className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      清空資料
                    </button>
                  )}
                </div>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="例如：&#13;月份,銷售額,利潤額&#13;一月,120000,32000&#13;二月,150000,45000"
                  className="w-full h-44 text-xs font-mono p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white resize-y outline-hidden focus:border-slate-300 focus:ring-1 focus:ring-slate-300/30 transition-all font-medium"
                />
              </div>

              {/* 使用者提問/聚焦指示 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  💡 自訂分析重點或特定提問 (選填)：
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="例如：請幫我針對銷售趨勢做重點解讀，並分析第三季異常..."
                  className="w-full text-xs px-4 py-3 border border-slate-200 rounded-xl outline-hidden focus:border-slate-300 focus:bg-white bg-slate-50 transition-all"
                />
              </div>

              {/* 按鈕運作群 */}
              <button
                disabled={isAnalyzing || !csvText.trim()}
                onClick={handleAnalyze}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold shadow-md transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer ${
                  isAnalyzing || !csvText.trim()
                    ? "bg-slate-200 text-slate-400 border border-slate-300/20 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg active:scale-[0.99]"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>AI 引擎正在分析數據中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>開始 AI 分析洞察</span>
                  </>
                )}
              </button>
            </div>

            {/* 歷史側邊面板在左側排版底部 */}
            <HistorySidebar
              items={historyItems}
              selectedId={activeHistoryId}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
            />

          </section>

          {/* 右欄：圖表大盤與 AI 分析結果 (佔 7 欄) */}
          <section className="lg:col-span-7 space-y-6">

            {/* 數據預覽表格 */}
            {parsedCSV.headers.length > 0 && (
              <div className="transition-all duration-300">
                <CSVTable headers={parsedCSV.headers} rows={parsedCSV.rows} />
              </div>
            )}

            {/* AI 分析報表主題 */}
            {isAnalyzing ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center relative">
                  <span className="absolute inset-0 rounded-3xl border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">正在驅動進階 AI 量化演算...</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    透過大型語言模型對您的報表表格進行交叉解構，評估數據維度、趨勢分析與制定最適之商業對策
                  </p>
                </div>
              </div>
            ) : activeResult ? (
              <div className="space-y-6">
                
                {/* 1. 核心指標摘要 */}
                {activeResult.summary.keyMetrics && activeResult.summary.keyMetrics.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 pl-1 uppercase tracking-wider">
                      📊 核心關鍵績效指標彙總 (KPI)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeResult.summary.keyMetrics.map((met, i) => (
                        <MetricCard key={i} metric={met} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 綜合評述 */}
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                  <div className="flex gap-2.5">
                    <TrendingUp className="w-5 h-5 text-blue-600 grow-0 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 font-semibold leading-relaxed">
                      {activeResult.summary.overallStatus}
                    </p>
                  </div>
                </div>

                {/* 2. 動態圖表視覺化 */}
                <AnalyticsChart
                  data={parsedCSV.rows}
                  headers={parsedCSV.headers}
                  numericColumns={parsedCSV.numericColumns}
                  suggestions={activeResult.visualSuggestions}
                />

                {/* 3. 深度 Markdown 分析報告 */}
                <InsightReport insights={activeResult.insights} />

                {/* 4. 落地商業決策建議 */}
                {activeResult.recommendations && activeResult.recommendations.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">決策對策與落地行動方針</h3>
                      <p className="text-xs text-slate-500 mt-0.5">基於數據分析結果所制定的高回報、可執行精準建議</p>
                    </div>
                    <RecommendationList recommendations={activeResult.recommendations} />
                  </div>
                )}

              </div>
            ) : (
              // 空白引導頁
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-4 min-h-[460px]">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Sheet className="w-8 h-8 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-700 text-base">等待填入數據進行分析</h3>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    您可以貼上報表 CSV 資料或是選擇左側附帶的零售銷售、網路轉化率、績效考核等「精選繁體中文範例」立即體驗。
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleApplySample(SAMPLE_DATASETS[0])}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50/60 hover:bg-blue-50 transition-colors border border-blue-100 hover:border-blue-200 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                    <span>即刻載入銷售範例測試</span>
                  </button>
                </div>
              </div>
            )}

          </section>

        </div>

      </main>
    </div>
  );
}
