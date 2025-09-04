// src/components/Navbar.tsx
import React, { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - 点击返回首页 */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span>AI 颜色配色生成器</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
             <Link to="/blog" className="text-white/80 hover:text-white transition-colors">
              文章教程
            </Link>
            <div className="text-green-400 font-semibold">
              🎉 完全免費使用
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-2">
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="block text-center text-white/80 py-2 rounded-lg hover:bg-white/10 transition-colors">
              文章教程
            </Link>
            <div className="text-center text-green-400 font-semibold py-2">
              🎉 完全免費使用
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}