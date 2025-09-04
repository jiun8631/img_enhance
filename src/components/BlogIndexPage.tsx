// src/components/BlogIndexPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { articles } from '../content/articles'

export default function BlogIndexPage() {
  return (
    <div className="max-w-3xl mx-auto text-white py-8">
      <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        文章与教程
      </h1>
      <p className="text-lg text-white/70 mb-12">
        探索色彩设计的世界，从理论基础到最新趋势，我们为您提供专业的见解与实用技巧。
      </p>

      <div className="space-y-10">
        {articles.map(article => (
          <Link key={article.id} to={`/blog/${article.id}`} className="block group">
            <div className="border-b border-white/10 pb-10">
              <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors mb-3">
                {article.title}
              </h2>
              <div className="text-white/60 text-sm mb-4 flex items-center gap-2">
                <article.icon className="w-4 h-4" />
                <span>{article.label}</span>
              </div>
              <p className="text-white/80 leading-relaxed">
                {/* 简单地从文章内容中提取第一段作为摘要 */}
                {article.content.props.children[0].props.children}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}