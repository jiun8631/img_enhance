// src/components/AboutPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Eye, Zap, Mail, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto text-white py-8">
      {/* 返回首頁的按鈕，提升用戶體驗 */}
      <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回首頁
      </Link>
      
      {/* 這裡使用了 Tailwind Typography 插件的類名來自動美化文章排版 */}
      <article className="prose prose-invert prose-p:text-white/80 prose-headings:text-white max-w-none">
        
        <h1>🌟 關於 AI 顏色配色生成器</h1>
        
        <h2>核心特色與優勢</h2>
        {/* 使用 not-prose 來跳出文章排版，以便使用自定義的 grid 佈局 */}
        <div className="grid md:grid-cols-3 gap-8 my-8 not-prose">
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <Award className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">先進的 AI 演算法</h3>
            <p className="text-sm text-white/70">採用色彩量化技術，從任何圖片中提取最和諧、最實用的顏色，遠超傳統取色工具。</p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <Eye className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">即時預覽與魔法漸層</h3>
            <p className="text-sm text-white/70">獨家的 UI 預覽和 AI 魔法漸層產生器，讓您在獲得配色的同時，立刻看到應用效果，激發無限靈感。</p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <Zap className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">注重無障礙設計</h3>
            <p className="text-sm text-white/70">內置 WCAG 對比度校驗，確保您的設計不僅美觀，更能被所有用戶輕鬆閱讀，提升用戶體驗與 SEO。</p>
          </div>
        </div>

        <h2>聯絡資訊</h2>
        <p>我們致力於為設計師和開發者提供最好的工具。如有任何建議、合作或問題，請透過電子郵件與我們聯絡：</p>
        <div className="flex items-center gap-2 my-4 not-prose">
          <Mail className="w-5 h-5 text-white/60" />
          {/* 【重要】請將 your-email@example.com 換成您真實的聯繫郵箱 */}
          <a href="mailto:ktv8631@gmail.com" className="text-blue-400 hover:underline">ktv8631@gmail.com</a>
        </div>

        {/* 使用 blockquote 標籤來展示名言，語義更清晰 */}
        <blockquote className="border-l-4 border-purple-500 pl-4 italic my-12 text-xl">
          <p>「設計不僅是外觀和感覺，設計是它如何運作。」</p>
          <cite className="block text-right not-italic text-base text-white/70 mt-2">—— 史蒂夫·賈伯斯</cite>
        </blockquote>

        <p className="text-center text-lg mt-12">感謝您使用我們的工具，願它能為您的創作帶來光彩！</p>
      </article>
    </div>
  );
}