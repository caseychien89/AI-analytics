export interface Metric {
  label: string;
  value: string;
  change?: string;
}

export interface Summary {
  totalRows: number;
  dimensions: string[];
  keyMetrics: Metric[];
  overallStatus: string;
}

export interface VisualSuggestions {
  chartType: "bar" | "line" | "area" | "pie";
  xAxisKey: string;
  yAxisKeys: string[];
}

export interface Recommendation {
  title: string;
  priority: "高" | "中" | "低";
  impact: "大" | "中" | "小";
  description: string;
}

export interface AnalysisResult {
  summary: Summary;
  visualSuggestions: VisualSuggestions;
  insights: string;
  recommendations: Recommendation[];
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  title: string;
  csvSize: string;
  csvData: string;
  result: AnalysisResult;
}
