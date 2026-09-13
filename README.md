# Longteng Bridge｜龍騰斷橋旅遊指南

以 Astro、Tailwind CSS 與 Markdown 製作的旅遊指南網站，內容使用台灣繁體中文，部署於 **Cloudflare Workers**（Workers Static Assets）。

## 本機開發

```bash
pnpm install
pnpm dev
```

建置並用 Wrangler 啟動本機 Worker（含伺服器端天氣區塊）：

```bash
pnpm preview
```

`pnpm dev` 與 `pnpm preview` 都使用 Astro 開發／預覽伺服器；`pnpm preview` 會先執行完整建置，較接近正式環境。

型別與內容檢查：

```bash
pnpm check
```

正式建置與部署：

```bash
pnpm build   # astro check && astro build，輸出至 dist/
pnpm deploy  # 檢查、建置後以 wrangler deploy 部署
```

輸出目錄為 `dist/`。

## 架構

- 絕大多數頁面在建置階段產生為靜態檔案，由 Workers Static Assets 直接回應。
- 只有「即時天氣」區塊以 Astro 伺服器孤島（`server:defer`）在收到請求時產生，
  並以 `Cache-Control: public, s-maxage=900, stale-while-revalidate=3600` 在邊緣節點重複使用。
- 網站不需要資料庫、使用者登入或執行階段環境變數。

## 內容結構

- `src/content/guides/`：Markdown 攻略內容（攻略頁自動產生 TDK、結構化資料與延伸閱讀）
- `src/pages/`：首頁、天氣專題、關於、隱私與資料來源等頁面
- `src/components/`：導覽、地圖、天氣面板、路線選擇器等元件
- `src/lib/weather.ts`：天氣取得與建議條件引擎
- `src/data/`：站點、景點實體、氣候、設施、延伸閱讀等資料
- `src/assets/`：已授權的真實景點照片

## SEO 與效能

- 繁體中文 `zh-Hant-TW`，`hreflang` 與 `x-default` 指向同一個非 www canonical
- 每頁獨立 title、description 與絕對 URL canonical
- WebSite、Organization、TouristAttraction、Article、BreadcrumbList、FAQPage 結構化資料
- 自動產生 Sitemap（`sitemap-index.xml`）與 `robots.txt`
- AVIF 響應式圖片、延遲載入 Google 地圖、首屏主視覺 `fetchpriority="high"`
- `public/_headers` 設定靜態資源快取與安全性標頭

### 部署後檢查清單

1. **www 與非 www 只保留一個正式網域。**
   Workers 的 `_redirects` 只接受「路徑」作為來源，**不支援跨主機（網域層級）轉址**，
   因此這一步必須在 Cloudflare 規則層完成：
   - 於 Cloudflare 控制台建立 **Redirect Rule**（Rules → Redirect Rules），
     條件為 `Hostname equals www.longtengbridge.com`，
     動作設為 `Static redirect` → `https://longtengbridge.com/`，
     保留路徑與查詢字串，狀態碼 **301**。
   - 或使用 **Bulk Redirects** 建立同等的來源／目標清單規則。
   - 設定完成後，用 `curl -I https://www.longtengbridge.com/visit/` 確認回傳 301 且導向非 www 路徑。
2. 在 Search Console 重新提交 `sitemap-index.xml`，並以「網址審查」確認 canonical 指向非 www。
3. 追蹤「龍騰斷橋天氣」相關查詢的曝光與點擊變化（對應 `/weather/` 專題頁）。
