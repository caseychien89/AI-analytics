import { Metric } from "../types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  metric: Metric;
}

export default function MetricCard({ metric }: MetricCardProps) {
  const isPositive = metric.change?.startsWith("+");
  const isNegative = metric.change?.startsWith("-");

  let changeColor = "text-gray-500 bg-gray-50 border-gray-200";
  if (isPositive) {
    changeColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
  } else if (isNegative) {
    changeColor = "text-rose-700 bg-rose-50 border-rose-100";
  }

  return (
    <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-slate-500">{metric.label}</span>
        {metric.change && (
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 font-medium rounded-full border ${changeColor}`}>
            {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
            {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
            {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5" />}
            {metric.change}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
          {metric.value}
        </span>
      </div>
      <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 rounded-l-2xl"></div>
    </div>
  );
}
