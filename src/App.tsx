// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import HomePage from '@/components/HomePage'

function AppContent() {
  return (
    // 【修改 1】: 移除深色漸層，改用主題變數
    // bg-background 會自動抓到我們在 index.css 定義的亮色背景
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
      
      {/* 【修改 2】: 讓 Toaster 的顏色也使用主題變數 */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            // 使用 CSS 變數，它會根據亮/暗模式自動改變
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
      
      {/* 【修改 3】: 側邊欄廣告區塊使用主題顏色 */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-40 h-96 bg-card/90 backdrop-blur-sm border border-border rounded-lg z-30 hidden lg:flex">
        <div className="h-full flex items-center justify-center text-muted-foreground text-sm text-center px-2">
          廣告區域<br />側邊欄<br />(160x600)
        </div>
      </div>
      
      {/* 【修改 4】: 底部廣告區塊使用主題顏色 */}
      <div className="fixed bottom-0 left-0 w-full bg-card/90 backdrop-blur-sm border-t border-border z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-muted-foreground text-sm">
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