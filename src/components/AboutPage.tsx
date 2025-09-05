// src/components/AboutPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Eye, Zap, Mail, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto text-white py-8">
      {/* 返回首页的按钮，提升用户体验 */}
      <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>
      
      {/* 这里使用了 Tailwind Typography 插件的类名来自动美化文章排版 */}
      <article className="prose prose-invert prose-p:text-white/80 prose-headings:text-white max-w-none">
        
        <h1>🌟 关于 AI 颜色配色生成器</h1>
        
        <h2>核心特色与优势</h2>
        {/* 使用 not-prose 来跳出文章排版，以便使用自定义的 grid 布局 */}
        <div className="grid md:grid-cols-3 gap-8 my-8 not-prose">
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <Award className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">先进的 AI 演算法</h3>
            <p className="text-sm text-white/70">采用色彩量化技术，从任何图片中提取最和谐、最实用的颜色，远超传统取色工具。</p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <Eye className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">即时预览与魔法渐层</h3>
            <p className="text-sm text-white/70">独家的 UI 预览和 AI 魔法渐层产生器，让您在获得配色的同时，立刻看到应用效果，激发无限灵感。</p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <Zap className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">注重无障碍设计</h3>
            <p className="text-sm text-white/70">内置 WCAG 对比度校验，确保您的设计不仅美观，更能被所有用户轻松阅读，提升用户体验与 SEO。</p>
          </div>
        </div>

        <h2>联络资讯</h2>
        <p>我们致力于为设计师和开发者提供最好的工具。如有任何建议、合作或问题，请透过电子邮件与我们联络：</p>
        <div className="flex items-center gap-2 my-4 not-prose">
          <Mail className="w-5 h-5 text-white/60" />
          {/* 【重要】请将 your-email@example.com 换成您真实的联系邮箱 */}
          <a href="mailto:ktv8631@gmail.com" className="text-blue-400 hover:underline">ktv8631@gmail.com</a>
        </div>

        {/* 使用 blockquote 标签来展示名言，语义更清晰 */}
        <blockquote className="border-l-4 border-purple-500 pl-4 italic my-12 text-xl">
          <p>「设计不仅是外观和感觉，设计是它如何运作。」</p>
          <cite className="block text-right not-italic text-base text-white/70 mt-2">—— 史蒂夫·贾伯斯</cite>
        </blockquote>

        <p className="text-center text-lg mt-12">感谢您使用我们的工具，愿它能为您的创作带来光彩！</p>
      </article>
    </div>
  );
}