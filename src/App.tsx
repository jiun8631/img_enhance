import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import HomePage from '@/components/HomePage'

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
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
      
      {/* Google AdSense - 側邊欄廣告 */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-40 h-96 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg z-30 hidden lg:flex">
        <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center px-2">
          廣告區域<br />側邊欄<br />(160x600)
        </div>
      </div>
      
      {/* Google AdSense - 底部廣告 */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 z-40">
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