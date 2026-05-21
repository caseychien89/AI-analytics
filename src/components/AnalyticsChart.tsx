import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { VisualSuggestions } from "../types";
import { BarChart3, LineChart as LineIcon, AreaChart as AreaIcon, PieChart as PieIcon, HelpCircle } from "lucide-react";

interface AnalyticsChartProps {
  data: Record<string, string | number>[];
  headers: string[];
  numericColumns: string[];
  suggestions?: VisualSuggestions;
}

const COLORS = [
  "#3b82f6", // Blue
  "#0ea5e9", // Sky Blue
  "#10b981", // Emerald Green
  "#f59e0b", // Amber Orange
  "#ec4899", // Pink
  "#8b5cf6", // Violet Purple
  "#f43f5e", // Rose Red
  "#64748b"  // Slate Gray
];

export default function AnalyticsChart({ data, headers, numericColumns, suggestions }: AnalyticsChartProps) {
  const [chartType, setChartType] = useState<"bar" | "line" | "area" | "pie">("bar");
  const [xAxisKey, setXAxisKey] = useState<string>("");
  const [yAxisKey, setYAxisKey] = useState<string>("");

  // 同步 AI 推薦設定，或者自動挑選欄位作為備用
  useEffect(() => {
    if (headers.length > 0) {
      // 挑選 X 軸：優先用 AI 推薦，否則優先用第一個「非數值」欄位，若都是數值則用第一個欄位
      const suggestedX = suggestions?.xAxisKey;
      if (suggestedX && headers.includes(suggestedX)) {
        setXAxisKey(suggestedX);
      } else {
        const nonNumeric = headers.find((h) => !numericColumns.includes(h));
        setXAxisKey(nonNumeric || headers[0]);
      }
    }

    if (numericColumns.length > 0) {
      // 挑選 Y 軸：優先用 AI 推薦的第一個，否則用第一個數值欄位
      const suggestedY = suggestions?.yAxisKeys?.[0];
      if (suggestedY && numericColumns.includes(suggestedY)) {
        setYAxisKey(suggestedY);
      } else {
        setYAxisKey(numericColumns[0]);
      }
    }

    // 挑選圖表類型：優先用 AI 推薦
    if (suggestions?.chartType) {
      setChartType(suggestions.chartType);
    }
  }, [data, headers, numericColumns, suggestions]);

  if (data.length === 0 || headers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400">
        <HelpCircle className="w-12 h-12 stroke-1 mb-2" />
        <span className="text-sm">資料不足，暫時無法繪製視覺化圖表。</span>
      </div>
    );
  }

  // 整理 Pie Chart 資料
  const pieData = data.map((row) => ({
    name: String(row[xAxisKey] || ""),
    value: Number(row[yAxisKey] || 0)
  }));

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
      {/* 圖表控制板 */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">資料動態視覺化</h3>
          <p className="text-xs text-slate-500 mt-0.5">可自訂維度與圖表型態，探索更細緻的趨勢變化</p>
        </div>

        {/* 控制項 */}
        <div className="flex flex-wrap items-center gap-4">
          {/* X軸 選擇 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">X 軸 (維度)：</span>
            <select
              value={xAxisKey}
              onChange={(e) => setXAxisKey(e.target.value)}
              className="text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 px-2.5 py-1.5 text-slate-700 outline-hidden focus:border-slate-300"
            >
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Y軸 選擇 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Y 軸 (度量)：</span>
            <select
              value={yAxisKey}
              onChange={(e) => setYAxisKey(e.target.value)}
              className="text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 px-2.5 py-1.5 text-slate-700 outline-hidden focus:border-slate-300"
            >
              {numericColumns.length === 0 ? (
                <option value="">無數值欄位</option>
              ) : (
                numericColumns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 圖表類型 */}
          <div className="flex items-center border border-slate-100 rounded-xl bg-slate-50 p-1">
            <button
              onClick={() => setChartType("bar")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                chartType === "bar" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="直條圖"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">直條圖</span>
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                chartType === "line" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="折線圖"
            >
              <LineIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">折線圖</span>
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                chartType === "area" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="面積圖"
            >
              <AreaIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">面積圖</span>
            </button>
            <button
              onClick={() => setChartType("pie")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                chartType === "pie" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="圓餅圖"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">圓餅圖</span>
            </button>
          </div>
        </div>
      </div>

      {/* 繪圖畫布區 */}
      <div className="w-full h-[380px] pt-4">
        {numericColumns.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl">
            <span className="text-sm">數據中不包含任何可分析的「數值」欄位。</span>
            <span className="text-xs text-slate-400 mt-1">請上傳帶有數值的 CSV (例如銷售額、流量、百分比)。</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey={xAxisKey}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold", fontSize: "12px" }}
                  itemStyle={{ color: "#fff", fontSize: "13px" }}
                />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />
                <Bar dataKey={yAxisKey} name={yAxisKey} fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {data.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : chartType === "line" ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey={xAxisKey}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold", fontSize: "12px" }}
                  itemStyle={{ color: "#fff", fontSize: "13px" }}
                />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />
                <Line
                  type="monotone"
                  dataKey={yAxisKey}
                  name={yAxisKey}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            ) : chartType === "area" ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey={xAxisKey}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={{ stroke: "#e2e8f0" }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold", fontSize: "12px" }}
                  itemStyle={{ color: "#fff", fontSize: "13px" }}
                />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />
                <Area
                  type="monotone"
                  dataKey={yAxisKey}
                  name={yAxisKey}
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorArea)"
                />
              </AreaChart>
            ) : (
              <PieChart>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                  itemStyle={{ color: "#fff", fontSize: "13px" }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: "12px" }} />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
