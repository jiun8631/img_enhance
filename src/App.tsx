// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import HomePage from '@/components/HomePage'
import BlogIndexPage from '@/components/BlogIndexPage'
import ArticlePage from '@/components/ArticlePage'
import AboutPage from '@/components/AboutPage'

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pb-24 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 py-8 lg:pr-[192px]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/blog/:articleId" element={<ArticlePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
        }}
      />
      
      {/* 廣告部分 */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-40 h-96 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg z-30 hidden lg:flex">
        <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center px-2">廣告區域</div>
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 z-40 hidden md:block">
        <div className="container mx-auto px-4 py-4 text-center text-gray-400 text-sm">
          廣告區域 - 底部橫幅
        </div> {/* <-- 我上次在這裡不小心把外層的 </div> 刪掉了 */}
      </div>
    </div> // <-- 這是根 div 的 closing tag，它是存在的
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