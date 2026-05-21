export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string | number>[];
  numericColumns: string[];
}

/**
 * 解析 CSV 字串（包含引號、逗號與換行支援）
 */
export function parseCSV(csvText: string): ParsedCSV {
  const lines: string[] = [];
  let currentLine = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // 雙引號轉義
        currentLine += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "\n" || char === "\r") {
      if (insideQuotes) {
        currentLine += char;
      } else {
        if (char === "\r" && nextChar === "\n") {
          i++; // 跳過 \n
        }
        lines.push(currentLine);
        currentLine = "";
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // 過濾空行
  const validLines = lines.map((line) => line.trim()).filter((line) => line.length > 0);
  if (validLines.length === 0) {
    return { headers: [], rows: [], numericColumns: [] };
  }

  // 拆分輔助函數，正確處理逗號與引號
  const splitCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let cell = "";
    let insideStr = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        insideStr = !insideStr;
      } else if (c === "," && !insideStr) {
        result.push(cell.trim());
        cell = "";
      } else {
        cell += c;
      }
    }
    result.push(cell.trim());
    return result;
  };

  const headers = splitCSVLine(validLines[0]).map(h => h.replace(/^"|"$/g, "").trim());
  const rows: Record<string, string | number>[] = [];

  for (let i = 1; i < validLines.length; i++) {
    const cells = splitCSVLine(validLines[i]).map(c => c.replace(/^"|"$/g, "").trim());
    const rowObj: Record<string, string | number> = {};

    headers.forEach((header, index) => {
      const cellValue = cells[index] !== undefined ? cells[index] : "";
      
      // 嘗試將純數字轉為 float，但保留 0 開頭可能為代碼的字串（如郵遞區號）、去除逗號貨幣格式
      const normalizedValue = cellValue.replace(/[\$,]/g, "");
      const num = Number(normalizedValue);
      if (cellValue !== "" && !isNaN(num) && !/^0\d+/.test(cellValue)) {
        rowObj[header] = num;
      } else {
        rowObj[header] = cellValue;
      }
    });
    rows.push(rowObj);
  }

  // 判斷哪些欄位是數值型欄位（非空且大部分資料為數值）
  const numericColumns: string[] = [];
  headers.forEach((header) => {
    let numericCount = 0;
    let totalCount = 0;

    rows.forEach((row) => {
      const val = row[header];
      if (val !== undefined && val !== "") {
        totalCount++;
        if (typeof val === "number") {
          numericCount++;
        }
      }
    });

    if (totalCount > 0 && numericCount / totalCount > 0.6) {
      numericColumns.push(header);
    }
  });

  return { headers, rows, numericColumns };
}

export interface SampleDataset {
  id: string;
  title: string;
  description: string;
  icon: string;
  csvData: string;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: "sales-report",
    title: "1. 季度零售銷售與利潤表",
    description: "包含產品類別、地區、銷售額、銷售件數、利潤率及退貨狀態。",
    icon: "ShoppingBag",
    csvData: `日期,產品類別,銷售地區,銷售額,銷售數量,利潤率,顧客滿意度
2026-01-15,智慧手機,北部,450000,150,0.22,4.7
2026-01-20,平板電腦,中部,280000,100,0.18,4.5
2026-02-05,筆記型電腦,南部,980000,245,0.15,4.8
2026-02-12,無線耳機,東部,120000,80,0.35,4.2
2026-02-28,智慧手機,南部,520000,175,0.24,4.6
2026-03-03,智慧穿戴,北部,310000,155,0.30,4.4
2026-03-10,平板電腦,南部,340000,120,0.17,4.3
2026-03-18,筆記型電腦,北部,1150000,280,0.16,4.9
2026-03-22,無線耳機,中部,180000,120,0.32,4.5
2026-03-29,智慧穿戴,中部,290000,145,0.28,4.1`
  },
  {
    id: "website-performance",
    title: "2. 電商平台網路流量與轉化率",
    description: "記錄每日廣告費用、訪客數、購物車加入率、結帳率、獲客成本（CAC）。",
    icon: "Globe",
    csvData: `日期,廣告通路,瀏覽量,付費點擊數,加入購物車數,成交訂單量,總廣告費用,總營收
2026-05-01,Google Search,45000,3200,480,128,12800,38400
2026-05-02,Social Ads,85000,6800,920,185,24000,55500
2026-05-03,KOL 合作,15000,1200,310,105,8000,31500
2026-05-04,EDM 電子郵件,22000,0,540,118,1500,29500
2026-05-05,Google Search,48000,3500,520,142,14000,42600
2026-05-06,Social Ads,91000,7200,1010,210,26000,63000
2026-05-07,與搜尋推薦,18000,0,220,64,0,16000
2026-05-08,KOL 合作,12000,950,220,78,6500,23400
2026-05-09,EDM 電子郵件,24000,0,590,135,1500,33750
2026-05-10,Google Search,52000,3800,560,155,15200,46500`
  },
  {
    id: "employee-performance",
    title: "3. 業務團隊績效考核表",
    description: "記錄部門成員、開發客戶數、銷售金額、工時與季度達標百分比。",
    icon: "Users",
    csvData: `姓名,部門,新開發客戶數,成交率,季度銷售總額,平均處理時長,績效評分
張家豪,業務一組,24,0.35,1850000,42,4.8
陳美玲,業務一組,31,0.42,2400000,38,4.9
王志強,業務二組,18,0.28,1250000,48,4.1
李佳欣,業務二組,28,0.31,1680000,45,4.4
林建宇,業務三組,15,0.22,950000,52,3.8
黃雅婷,業務三組,35,0.48,3100000,32,5.0
劉冠宏,業務一組,22,0.30,1420000,44,4.3
吳敏君,業務二組,26,0.34,1750000,40,4.6
蔡明達,業務三組,19,0.27,1100000,50,4.0
鄭淑芬,業務一組,29,0.38,2100000,36,4.7`
  }
];
