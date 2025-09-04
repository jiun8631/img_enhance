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