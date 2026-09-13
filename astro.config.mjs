import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// 部署目標：Cloudflare Workers（靜態資源 + 需要時才動態產生的區塊）
// - 絕大多數頁面在建置時就產生為靜態檔案，由 Workers Static Assets 直接回傳。
// - 只有「即時天氣」這類需要每次請求都可能變動的區塊走 Worker 動態產生，並在邊緣快取。
export default defineConfig({
  site: "https://longtengbridge.com",
  trailingSlash: "always",
  output: "static",
  integrations: [sitemap()],
  adapter: cloudflare({
    // 站上圖片都在建置階段最佳化，不需要 Cloudflare Images 綁定。
    imageService: "compile",
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
