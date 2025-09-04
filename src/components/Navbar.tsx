// src/components/Navbar.tsx
import React, { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'
// 【重要】從 react-router-dom 導入 NavLink，它比 Link 更強大
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 將導航連結抽離出來，方便管理
  const navLinks = [
    { to: "/", text: "首頁" },
    { to: "/blog", text: "文章教程" },
    { to: "/about", text: "關於我們" },
  ];

  return (
    <nav className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - 點擊返回首頁 */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span>AI 顏色配色生成器</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              // 使用 NavLink，它可以知道當前連結是否為 active 狀態
              <NavLink 
                key={link.to} 
                to={link.to} 
                // 根據是否為 active 頁面，動態添加不同的 CSS 類名
                className={({ isActive }) =>
                  `transition-colors duration-200 ${isActive ? 'text-white font-semibold' : 'text-white/70 hover:text-white'}`
                }
              >
                {link.text}
              </NavLink>
            ))}
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
            {navLinks.map(link => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                onClick={() => setMobileMenuOpen(false)} 
                className={({isActive}) => 
                  `block text-center py-3 rounded-lg transition-colors text-lg ${isActive ? 'bg-white/10 text-white font-semibold' : 'text-white/70'}`
                }
              >
                {link.text}
              </NavLink>
            ))}
             <div className="text-center text-green-400 font-semibold py-2 mt-2 border-t border-white/10">
              🎉 完全免費使用
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}