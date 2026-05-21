import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();

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
          'User-Agent': 'ai-analytics-app',
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
      "你是一位專業的資料分析師。你的任務是接收一段 CSV 或表格結構的原始數據，理解其欄位意義，並提出精確的摘要報告與洞察。\n" +
      "請遵循以下指導原則：\n" +
      "1. 使用繁體中文（zh-TW）做所有的回覆，語意應專業、嚴謹且富含商業決策價值。\n" +
      "2. 你的回覆必須依循規定的 JSON 格式輸出，以便前端能夠解析成精美的視覺化卡片、指標與圖表。\n" +
      "3. 對數據進行適當的統計計算，並在 keyMetrics 及 insights 中呈現。\n\n" +
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
      "  \"insights\": \"### 1. 📊 資料概況與欄位理解\\n簡要說明這份資料的主題是什麼，並列出關鍵欄位的意義。\\n\\n### 2. ⚠️ 異常與缺值檢查\\n檢查資料中是否有空白（例如缺少數量或金額）、極端值（例如不合理的高價），並將發現的異常項目條列出來。若無異常，說明『未發現明顯異常』。\\n\\n### 3. 📈 統計與趨勢洞察\\n請回答以下問題的總結：\\n- **總計概況**：銷售數量或總金額的大概加總。\\n- **分類表現**：哪個業務員或哪項產品表現最好？\\n- **業務建議**：從數據中給出 1-2 個可以執行的商業建議。\",\n" +
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
      throw new Error("AI 無法生成 any 洞察，請重試或嘗試調整 CSV 輸入格式。");
    }

    // Attempt to parse to check json integrity before sending to frontend
    const parsed = JSON.parse(text.trim());
    return res.json(parsed);

  } catch (error: any) {
    console.error("AI 分析發生致命錯誤:", error);
    res.status(500).json({
      error: error.message || "AI 分析計算遭遇瓶頸，這可能是因為 API 密鑰尚未配置或資料結構過於龐大。請確認伺服器環境變數已設定 GEMINI_API_KEY。"
    });
  }
});

export default app;
