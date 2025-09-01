// src/App.tsx

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import HomePage from '@/components/HomePage'

function AppContent() {
  return (
    // 【重要】為根容器添加 pb-24 和 md:pb-0，為手機底部預留空間，並在桌面移除
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pb-24 md:pb-0">
      <Navbar />
      {/* 【關鍵修復 1】為主內容區添加響應式 padding，防止內容被廣告遮擋 */}
      {/* 在大螢幕 (lg) 上，為右側廣告欄預留出空間 */}
      <main className="container mx-auto px-4 py-8 lg:pr-[192px]">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
        }}
      />
      
      {/* 【關鍵修復 2】側邊欄廣告：默認隱藏 (hidden)，只在 lg (1024px) 以上的螢幕顯示 (lg:flex) */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-40 h-96 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg z-30 hidden lg:flex">
        <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center px-2">
          廣告區域<br />側邊欄<br />(160x600)
        </div>
      </div>
      
      {/* 【關鍵修復 3】底部廣告：默認隱藏 (hidden)，只在 md (768px) 以上的螢幕顯示 (md:block) */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 z-40 hidden md:block">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-gray-400 text-sm">
            廣告區域 - 底部橫幅 (728x90)
          </div>
        </div>
      </div>
    </div>
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