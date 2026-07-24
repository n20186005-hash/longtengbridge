# Longteng Bridge｜龍騰斷橋旅遊指南

以 Astro、Tailwind CSS 與 Markdown 製作的靜態旅遊網站，內容使用台灣繁體中文，部署目標為 Cloudflare Pages。

## 本機開發

```bash
pnpm install
pnpm dev
```

使用 Bun 也可直接啟動；預設開發指令會先建置網站，再使用 Cloudflare
Pages 的本機執行環境提供首頁與天氣 API：

```bash
bun run dev
```

啟動後請開啟 `http://localhost:8791`。

只修改純靜態版面、需要 Astro 熱更新時，可使用：

```bash
pnpm dev:astro
```

正式建置：

```bash
pnpm build
```

輸出目錄為 `dist/`。

## Cloudflare Pages

在 Cloudflare Pages 連接 Git 儲存庫後使用以下設定：

```text
Framework preset: Astro
Build command: pnpm build
Build output directory: dist
Node.js version: 22 或更新版本
```

也可在已登入 Cloudflare 的環境直接上傳：

```bash
pnpm deploy
```

網站不需要資料庫、使用者登入或執行階段環境變數。首頁天氣由
Cloudflare Pages Function 代理 Open-Meteo，並使用 Cloudflare 邊緣快取。

## 內容結構

- `src/content/guides/`：Markdown 攻略內容
- `src/pages/`：首頁、政策與動態攻略路由
- `src/components/`：導覽、地圖、路線選擇器等元件
- `functions/api/weather.js`：龍騰斷橋周邊天氣 API
- `src/assets/`：已授權的真實景點照片
- `src/data/site.ts`：導覽、站點與圖片授權資料

## SEO 與效能

- 繁體中文 `zh-Hant-TW`
- 每頁獨立 title、description 與 canonical
- WebSite、TouristAttraction、Article、BreadcrumbList、FAQPage 結構化資料
- 自動產生 Sitemap 與 robots.txt
- AVIF 響應式圖片、延遲載入 Google 地圖
- Cloudflare Pages 靜態資源快取標頭
