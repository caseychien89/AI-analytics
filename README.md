<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AI 數據分析與商業智慧洞察工具 (AI Analytics & BI Insights)

這是一個基於 **React 19 + TypeScript + Express** 架構開發的 AI 數據分析與視覺化應用程式。整合了 Google Gemini API，讓使用者能夠上傳 CSV 報表並自動生成專業的商業智慧（BI）分析與動態圖表。

本專案已完成通用化改造，支援在任何標準 Node.js 環境、Docker 容器或雲端平台（如 Render、Railway、Fly.io、自建 VPS 等）上無縫部署。

---

## 🚀 本地開發與運行 (Local Development)

### 先決條件
* 已安裝 **Node.js** (建議 v18 或 v20+)
* 擁有 **Gemini API Key** (可至 Google AI Studio 申請)

### 啟動步驟
1. **安裝依賴項目**：
   ```bash
   npm install
   ```
2. **配置環境變數**：
   直接編輯專案根目錄下的 `.env` 檔案，填入您的 API 金鑰：
   ```env
   GEMINI_API_KEY="您的_GEMINI_API_KEY"
   ```
3. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```
   啟動後，請在瀏覽器中開啟 `http://localhost:3000`。

---

## 📦 生產環境部署 (Production Deployment)

在生產環境中，前端代碼將會被編譯為最佳化的靜態網頁（放在 `dist`），後端伺服器則會由 `esbuild` 打包並託管該靜態資源。

### 1. 標準 Node.js 部署 (VPS / 伺服器)
1. **安裝所有依賴**：
   ```bash
   npm install
   ```
2. **進行生產環境打包**：
   ```bash
   npm run build
   ```
   此步驟會生成：
   * 前端靜態資源：`dist/`
   * 後端單一編譯檔：`dist/server.cjs`
3. **設定環境變數並啟動服務**：
   在執行環境中配置必要的環境變數：
   ```bash
   export PORT=8080
   export NODE_ENV=production
   export GEMINI_API_KEY="您的_GEMINI_API_KEY"
   ```
4. **啟動服務**：
   ```bash
   npm run start
   ```

---

### 2. Docker 容器化部署
本專案已內建最佳化的多階段建置 (Multi-stage build) `Dockerfile`，能有效縮減容器體積。

1. **建置 Docker 映像檔**：
   ```bash
   docker build -t ai-analytics-app .
   ```
2. **執行 Docker 容器**（請將 `your_api_key_here` 替換為真實的金鑰）：
   ```bash
   docker run -d -p 3000:3000 -e GEMINI_API_KEY="your_api_key_here" --name ai-analytics-container ai-analytics-app
   ```
3. **存取服務**：
   開啟 `http://localhost:3000` 即可使用。

---

### 3. 一鍵部署至雲端託管平台 (Render / Railway / Fly.io)
本專案的 `server.ts` 會自動讀取平台分配的 `PORT` 環境變數，因此在雲端平台上部署非常簡單：

#### 部署於 Render / Railway
1. 將此專案推送至您的 GitHub 儲存庫。
2. 在託管平台建立一個新的 **Web Service**，並連結至該儲存庫。
3. 平台會自動偵測 `package.json`，請設定以下欄位：
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm run start`
4. 在 **Environment Variables** (環境變數設定) 中新增：
   * `GEMINI_API_KEY`: 您的 Gemini API Key
   * `NODE_ENV`: `production`
5. 點擊部署，完成！

---

### 4. ⚡ 部署至 Netlify (Serverless Functions 模式)
本專案已完全優化，原生支援在 Netlify 上以 Serverless 模式部署（使用 Netlify Functions 承接 Express API，Netlify CDN 託管 React 靜態網頁）。

#### 部署步驟
1. **推送至 GitHub**：將此專案的所有檔案（包括新建立的 `netlify.toml`、`netlify/`、`server-app.ts` 等）推送至您的 GitHub 儲存庫。
2. **在 Netlify 建立網站**：
   * 登入 [Netlify](https://www.netlify.com/)。
   * 點選 **Add new site** -> **Import an existing project**，連結您的 GitHub 帳號並選取此專案的儲存庫。
3. **確認建置設定**：
   Netlify 會自動讀取專案中的 `netlify.toml` 檔案，請確認建置設定是否如下：
   * **Build Command**: `npm run build`
   * **Publish directory**: `dist`
4. **配置環境變數**：
   * 點選 **Site Configuration** -> **Environment variables**。
   * 新增環境變數：
     * `GEMINI_API_KEY`: 填入您的 Gemini API Key。
5. **點選 Deploy 部署**，稍等一分鐘即可完成部署，取得您的專屬 `.netlify.app` 網址！

