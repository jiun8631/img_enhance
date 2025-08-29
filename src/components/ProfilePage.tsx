import React, { useEffect, useState } from 'react'
import { User, Mail, Calendar, Zap, Star, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useImageEnhancement } from '@/hooks/useImageEnhancement'
import { UserProfile } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { fetchUserHistory, userProfile } = useImageEnhancement()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        await fetchUserHistory(1, 0) // Just load profile, not full history
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [])

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('登出失敗')
    } else {
      toast.success('已成功登出')
    }
  }

  const getPlanColor = (planType: string) => {
    switch (planType?.toLowerCase()) {
      case 'premium':
        return 'text-yellow-400'
      case 'pro':
        return 'text-purple-400'
      case 'free':
      default:
        return 'text-blue-400'
    }
  }

  const getPlanFeatures = (planType: string) => {
    switch (planType?.toLowerCase()) {
      case 'premium':
        return [
          '無限次 AI 圖像增強',
          '優先處理佇列',
          '8K 超高解析度輸出',
          '批量處理功能',
          '24/7 優先技術支援'
        ]
      case 'pro':
        return [
          '每月 100 次增強額度',
          '優先處理佇列',
          '4K 高解析度輸出',
          '進階 AI 演算法',
          '雲端存储增加'
        ]
      case 'free':
      default:
        return [
          '每月 10 次免費額度',
          '基礎 AI 增強功能',
          '2K 解析度輸出',
          '標準處理佇列',
          '社區技術支援'
        ]
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <User className="w-8 h-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">個人資料</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                基本資訊
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {userProfile?.display_name || '未設定昵稱'}
                    </div>
                    <div className="text-white/60 text-sm">用戶昵稱</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 text-white/40" />
                  <div>
                    <div className="text-white font-medium">{user?.email}</div>
                    <div className="text-white/60 text-sm">郵箱地址</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-white/40" />
                  <div>
                    <div className="text-white font-medium">
                      {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('zh-TW') : '未知'}
                    </div>
                    <div className="text-white/60 text-sm">加入日期</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                使用統計
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {userProfile?.credits_remaining || 0}
                  </div>
                  <div className="text-white/60">剩餘額度</div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((userProfile?.credits_remaining || 0) / 10 * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {userProfile?.total_processed || 0}
                  </div>
                  <div className="text-white/60">總處理數</div>
                  <div className="text-white/40 text-sm mt-1">
                    節省了 {((userProfile?.total_processed || 0) * 2.5).toFixed(1)} 小時的手工修圖時間
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                當前套餐
              </h2>
              
              <div className="text-center mb-6">
                <div className={`text-2xl font-bold mb-2 capitalize ${getPlanColor(userProfile?.plan_type || 'free')}`}>
                  {userProfile?.plan_type || 'Free'} 計劃
                </div>
                <div className="text-white/60 text-sm">
                  {userProfile?.plan_type === 'free' ? '免費版本' : '付費版本'}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {getPlanFeatures(userProfile?.plan_type || 'free').map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>

              {userProfile?.plan_type === 'free' && (
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                  升級套餐
                </button>
              )}
            </div>

            {/* Account Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">帳戶操作</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  登出帳戶
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}