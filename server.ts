import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Middleware to parse incoming requests with large payloads
app.use(express.json({ limit: "20mb" }));

// Security helper: Check if API key is present
app.get("/api/config", (req, res) => {
  const isApiKeyConfigured = !!process.env.GEMINI_API_KEY;
  res.json({ isApiKeyConfigured });
});

// Core Analytical Route
app.post("/api/analyze", async (req, res) => {
  try {
    const { csvData, customPrompt } = req.body;
    if (!csvData || typeof csvData !== "string" || csvData.trim() === "") {
      return res.status(400).json({ error: "請提供有效的 CSV 數據內容" });
    }

    const ai = getGeminiClient();

    const systemInstruction = 
      "你是一位專業的高級數據分析師與商業智慧（BI）專家。你的任務是深入分析使用者上傳的 CSV 格式報表資料。\n" +
      "請遵循以下指導原則：\n" +
      "1. 使用繁體中文（zh-TW）做所有的回覆，語意應專業、嚴謹且富含商業決策價值。\n" +
      "2. 你的回覆必須依循規定的 JSON 格式輸出，以便前端能夠解析成精美的視覺化卡片、指標與圖表。\n" +
      "3. 分析內容必須深入且具體，避免空洞敘述。直接點出趨勢、異常值、潛在機會與改善建議。\n" +
      "4. 對數據進行適當的統計計算（例如：加總、平均、最大/最小值、增長率等並在 keyMetrics 及 insights 中呈現）。\n\n" +
      "輸出格式必須是合法的 JSON 對象，結構定義如下（不可含有 ```json 等標記，直接輸出純 JSON 字串）：\n" +
      "{\n" +
      "  \"summary\": {\n" +
      "    \"totalRows\": 10, // 資料筆數\n" +
      "    \"dimensions\": [\"維度1\", \"維度2\"], // 主要欄位或維度列表\n" +
      "    \"keyMetrics\": [\n" +
      "      { \"label\": \"指標名稱1\", \"value\": \"1,245\", \"change\": \"+12.4%\" },\n" +
      "      { \"label\": \"指標名稱2\", \"value\": \"$8,964\", \"change\": \"-2.1%\" }\n" +
      "    ],\n" +
      "    \"overallStatus\": \"綜合大局評估：一句話簡明扼要地概述數據背後的核心狀態與趨勢。\"\n" +
      "  },\n" +
      "  \"visualSuggestions\": {\n" +
      "    \"chartType\": \"bar\" | \"line\" | \"area\" | \"pie\",\n" +
      "    \"xAxisKey\": \"建議的 X 軸配對欄位名稱（必須與預期 CSV 欄位英文或中文名稱完全相符）\",\n" +
      "    \"yAxisKeys\": [\"建議的 Y 軸數值欄位名稱（必須完全與 CSV 中數據欄位名稱完全相符）\"]\n" +
      "  },\n" +
      "  \"insights\": \"### 數據深度分析與洞察報告\\n\\n在此回答豐富細緻、專業的 Markdown 商業洞察。包含：\\n- **資料趨勢深度解構**\\n- **異常波動與關鍵驅動因子**\\n- **多維度交叉對比洞察**\\n- **潛在營收與流程改進空間**\",\n" +
      "  \"recommendations\": [\n" +
      "    {\n" +
      "      \"title\": \"建議措施名稱\",\n" +
      "      \"priority\": \"高\" | \"中\" | \"低\",\n" +
      "      \"impact\": \"大\" | \"中\" | \"小\",\n" +
      "      \"description\": \"具體的行動指南與可落地的方針。\"\n" +
      "    }\n" +
      "  ]\n" +
      "}";

    const userPrompt = `這是我要分析的 CSV 報表資料：\n\n${csvData}\n\n${customPrompt ? `使用者特別指定關注或提問：\n${customPrompt}\n` : ""}\n請開始依照規定的 JSON 結構做最詳盡的繁體中文分析。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.15,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI 無法生成任何洞察，請重試或嘗試調整 CSV 輸入格式。");
    }

    // Attempt to parse to check json integrity before sending to frontend
    const parsed = JSON.parse(text.trim());
    return res.json(parsed);

  } catch (error: any) {
    console.error("AI 分析發生致命錯誤:", error);
    res.status(500).json({
      error: error.message || "AI 分析計算遭遇瓶頸，這可能是因為 API 密鑰尚未配置或資料結構過於龐大。請前往 Settings > Secrets 設定 GEMINI_API_KEY。"
    });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server is listening on port ${PORT}`);
  });
}

startServer();
