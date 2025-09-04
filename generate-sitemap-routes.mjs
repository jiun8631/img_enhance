// generate-sitemap-routes.mjs
import fs from 'fs';
import path from 'path';

// 注意：我們不能直接 import articles.tsx，因為這是一個 Node.js 腳本
// 我們需要用一種變通的方法來讀取文章的 ID

const articlesFilePath = path.resolve(process.cwd(), 'src/content/articles.tsx');
const articlesFileContent = fs.readFileSync(articlesFilePath, 'utf-8');

// 使用正則表達式從文件中提取所有的 id
const articleIds = [...articlesFileContent.matchAll(/id: '([^']*)'/g)].map(match => match[1]);

const articleRoutes = articleIds.map(id => `/blog/${id}`);

const allRoutes = [
  '/',
  '/blog',
  ...articleRoutes
];

// 我們將結果寫入一個臨時的 JSON 文件，讓 vite.config.ts 來讀取
fs.writeFileSync(path.resolve(process.cwd(), 'sitemap-routes.json'), JSON.stringify(allRoutes, null, 2));

console.log('Sitemap routes generated successfully!');