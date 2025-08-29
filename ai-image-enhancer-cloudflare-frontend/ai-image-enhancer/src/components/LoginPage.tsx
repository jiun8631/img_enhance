import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const { user, signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('請填入所有必填欄位')
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          toast.error(error.message || '登錄失敗')
        } else {
          toast.success('登錄成功')
        }
      } else {
        const { error } = await signUp(email, password)
        if (error) {
          toast.error(error.message || '註冊失敗')
        } else {
          toast.success('註冊成功！請檢查您的郵箱進行驗證')
        }
      }
    } catch (error: any) {
      toast.error(error.message || '操作失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? '登錄帳戶' : '註冊帳戶'}
            </h2>
            <p className="text-white/70">
              {isLogin ? '歡迎回來！繼續您的 AI 圖像增強之旅' : '加入我們，体驗先進的 AI 圖像技術'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                郵箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="請輸入您的郵箱"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                密碼
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={isLogin ? '請輸入密碼' : '請設定密碼（至少 6 位）'}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {isLogin ? '登錄中...' : '註冊中...'}
                </>
              ) : (
                isLogin ? '登錄' : '註冊'
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-white/60">
              {isLogin ? '還沒有帳戶？' : '已有帳戶？'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors"
              >
                {isLogin ? '立即註冊' : '立即登錄'}
              </button>
            </p>
          </div>

          {/* Features */}
          {!isLogin && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-white/80 font-medium mb-3 text-center">註冊可享受：</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                  免費 10 次 AI 圖像增強額度
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3" />
                  雲端存储處理歷史
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
                  優先處理佇列
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-white/60 hover:text-white/80 transition-colors"
          >
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  )
}