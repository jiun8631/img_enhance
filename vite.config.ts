// vite.config.ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'
import sitemap from 'vite-plugin-sitemap'
import routes from './sitemap-routes.json' // <-- 直接導入生成的 JSON 文件

const isProd = process.env.BUILD_MODE === 'prod'

export default defineConfig({
  plugins: [
    react(), 
    sourceIdentifierPlugin({ enabled: !isProd, attributePrefix: 'data-matrix', includeProps: true }),
    sitemap({
      hostname: 'https://img-enhance.pages.dev', // 【重要！】换成您的域名
      dynamicRoutes: routes, // <-- 使用從 JSON 文件讀取的路由
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
})