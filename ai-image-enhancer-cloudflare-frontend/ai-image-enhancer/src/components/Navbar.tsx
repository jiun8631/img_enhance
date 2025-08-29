import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, LogOut, Menu, X, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('登出失敗')
    } else {
      toast.success('已成功登出')
    }
  }

  return (
    <nav className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span>AI圖像增強器</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">
              首頁
            </Link>
            {user && (
              <>
                <Link to="/history" className="text-white/80 hover:text-white transition-colors">
                  處理歷史
                </Link>
                <Link to="/profile" className="text-white/80 hover:text-white transition-colors">
                  個人資料
                </Link>
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white/80 text-sm">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 px-4 py-2 rounded-lg text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>登出</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 px-4 py-2 rounded-lg text-white transition-colors"
              >
                <User className="w-4 h-4" />
                <span>登錄</span>
              </Link>
            )}
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
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                首頁
              </Link>
              {user && (
                <>
                  <Link
                    to="/history"
                    className="text-white/80 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    處理歷史
                  </Link>
                  <Link
                    to="/profile"
                    className="text-white/80 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    個人資料
                  </Link>
                </>
              )}
              <div className="border-t border-white/10 pt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="text-white/60 text-sm">{user.email}</div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 px-4 py-2 rounded-lg text-white transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>登出</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 px-4 py-2 rounded-lg text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>登錄</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}