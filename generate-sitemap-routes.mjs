// generate-sitemap-routes.mjs
import fs from 'fs';
import path from 'path';

const articlesFilePath = path.resolve(process.cwd(), 'src/content/articles.tsx');
const articlesFileContent = fs.readFileSync(articlesFilePath, 'utf-8');

// 使用正則表達式從文件中提取所有的 id
// 這個正則表達式會找到所有 id: '...' 的字串，並提取引號中的內容
const articleIds = [...articlesFileContent.matchAll(/id: '([^']*)'/g)].map(match => match[1]);

// 根據提取出的 id 數組，生成 /blog/... 的路由
const articleRoutes = articleIds.map(id => `/blog/${id}`);

// 這裡定義了所有的路由
const allRoutes = [
  '/',        // 首頁
  '/blog',    // 博客列表頁
  '/about',   // 【這就是我們新增的關於頁面路由】
  ...articleRoutes // 自動加入所有文章的路由
];

// 將最終的路由列表寫入 sitemap-routes.json 文件
// vite.config.ts 會讀取這個文件，所以我們不需要再碰 vite.config.ts 了
fs.writeFileSync(
  path.resolve(process.cwd(), 'sitemap-routes.json'), 
  JSON.stringify(allRoutes, null, 2)
);

console.log('Sitemap routes generated successfully with "/about" page!');