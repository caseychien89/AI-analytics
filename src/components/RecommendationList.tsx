import { Recommendation } from "../types";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface RecommendationListProps {
  recommendations: Recommendation[];
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "高":
        return {
          bg: "bg-rose-50 border-rose-100 text-rose-700",
          dot: "bg-rose-500",
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />
        };
      case "中":
        return {
          bg: "bg-amber-50 border-amber-100 text-amber-700",
          dot: "bg-amber-500",
          icon: <Info className="w-4 h-4 text-amber-600" />
        };
      default:
        return {
          bg: "bg-sky-50 border-sky-100 text-sky-700",
          dot: "bg-sky-500",
          icon: <CheckCircle2 className="w-4 h-4 text-sky-600" />
        };
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "大":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "中":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => {
        const style = getPriorityStyle(rec.priority);
        return (
          <div
            key={index}
            className="flex flex-col md:flex-row gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-sm"
          >
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {style.icon}
                <h4 className="text-base font-semibold text-slate-900">{rec.title}</h4>
                
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  優先級：{rec.priority}
                </span>

                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getImpactBadge(rec.impact)}`}>
                  影響力：{rec.impact}
                </span>
              </div>
              <p className="text-sm font-normal text-slate-600 leading-relaxed pl-6">
                {rec.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
