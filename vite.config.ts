// vite.config.ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'
import sitemap from 'vite-plugin-sitemap'
import { articles } from './src/content/articles' // 导入文章数据

const isProd = process.env.BUILD_MODE === 'prod'

// 生成文章的路由
const articleRoutes = articles.map(article => `/blog/${article.id}`);

export default defineConfig({
  plugins: [
    react(), 
    sourceIdentifierPlugin({ enabled: !isProd, attributePrefix: 'data-matrix', includeProps: true }),
    sitemap({
      hostname: 'https://img-enhance.pages.dev', // 【重要！】换成您的域名
      dynamicRoutes: [
        '/',
        '/blog',
        ...articleRoutes // 将所有文章路由动态加入 sitemap
      ],
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
})