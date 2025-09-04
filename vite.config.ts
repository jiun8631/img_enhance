import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'
import sitemap from 'vite-plugin-sitemap' // 1. 導入 sitemap 工具

const isProd = process.env.BUILD_MODE === 'prod'

export default defineConfig({
  plugins: [
    react(), 
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    }),
    // 2. 加入 sitemap 的設定
    sitemap({
      // 【重要！】請將這裡換成您自己的網站域名
      hostname: 'https://img-enhance.pages.dev', 
      
      // 您的網站目前只有一個主頁
      dynamicRoutes: [
        '/',
      ],

      // 設定更新頻率
      changefreq: 'weekly',
      priority: 1.0,
      
      // 輸出 sitemap.xml 到 dist 資料夾的根目錄
      // (這是預設行為，寫出來更清晰)
      outDir: 'dist',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})