// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import HomePage from '@/components/HomePage'
import BlogIndexPage from '@/components/BlogIndexPage' // 导入博客列表页
import ArticlePage from '@/components/ArticlePage'   // 导入文章详情页
import AboutPage from '@/components/AboutPage'; // 1. 導入我們的新頁面組件

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pb-24 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 py-8 lg:pr-[192px]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/blog/:articleId" element={<ArticlePage />} />
          <Route path="/about" element={<AboutPage />} /> {/* 2. 新增這一行路由規則 */}
        </Routes>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
        }}
      />
      
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App