// src/components/ArticlePage.tsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { articles } from '../content/articles'
import { ArrowLeft } from 'lucide-react'

export default function ArticlePage() {
  const { articleId } = useParams<{ articleId: string }>()
  const article = articles.find(a => a.id === articleId)

  if (!article) {
    return (
      <div className="text-center text-white py-20">
        <h1 className="text-4xl font-bold mb-4">404 - 未找到文章</h1>
        <p className="text-white/80 mb-8">您要找的文章不存在或已被移动。</p>
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto text-white py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>
      <article className="prose prose-invert prose-p:text-white/80 prose-headings:text-white max-w-none">
        <h1>{article.title}</h1>
        {article.content}
      </article>
    </div>
  )
}