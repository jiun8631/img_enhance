import React, { useEffect, useState } from 'react'
import { History, Download, Clock, CheckCircle, XCircle, Loader2, Image as ImageIcon } from 'lucide-react'
import { useImageEnhancement } from '@/hooks/useImageEnhancement'
import { ImageEnhancement } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export default function HistoryPage() {
  const { fetchUserHistory, history, userProfile } = useImageEnhancement()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      setLoading(true)
      try {
        await fetchUserHistory()
      } catch (error) {
        console.error('Failed to load history:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadHistory()
  }, [])

  const downloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('圖片下載成功')
    } catch (error) {
      toast.error('下載失敗')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'processing':
      case 'queued':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完成'
      case 'failed':
        return '失敗'
      case 'processing':
        return '處理中'
      case 'queued':
        return '排隊中'
      default:
        return '待處理'
    }
  }

  const getEnhancementTypeText = (type: string) => {
    switch (type) {
      case 'upscale':
        return '超解析度放大'
      case 'denoise':
        return '降噪優化'
      case 'sharpen':
        return '銳化增強'
      case 'restore':
        return '照片修復'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-white/80">加載處理歷史...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <History className="w-8 h-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">處理歷史</h1>
          </div>
          
          {userProfile && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {userProfile.credits_remaining}
                  </div>
                  <div className="text-white/60 text-sm">剩餘額度</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {userProfile.total_processed}
                  </div>
                  <div className="text-white/60 text-sm">總處理數</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1 capitalize">
                    {userProfile.plan_type}
                  </div>
                  <div className="text-white/60 text-sm">當前套餐</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 text-center">
            <ImageIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">還沒有處理歷史</h3>
            <p className="text-white/60 mb-6">上傳您的第一張圖片開始 AI 增強之旅</p>
            <a
              href="/"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              開始使用
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item: ImageEnhancement) => (
              <div
                key={item.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="grid md:grid-cols-4 gap-6 items-center">
                  {/* Original Image */}
                  <div className="space-y-2">
                    <div className="text-white/60 text-sm font-medium">原始圖片</div>
                    <img
                      src={item.original_image_url}
                      alt="Original"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Enhanced Image */}
                  <div className="space-y-2">
                    <div className="text-white/60 text-sm font-medium">增強結果</div>
                    {item.enhanced_image_url ? (
                      <img
                        src={item.enhanced_image_url}
                        alt="Enhanced"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-24 bg-white/5 rounded-lg flex items-center justify-center">
                        <span className="text-white/40 text-sm">尚未完成</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.processing_status)}
                      <span className="text-white font-medium">
                        {getStatusText(item.processing_status)}
                      </span>
                    </div>
                    <div className="text-white/60 text-sm">
                      {getEnhancementTypeText(item.enhancement_type)} × {item.scale_factor}
                    </div>
                    <div className="text-white/40 text-xs">
                      {new Date(item.created_at).toLocaleString('zh-TW')}
                    </div>
                    {item.processing_time_seconds && (
                      <div className="text-white/40 text-xs">
                        處理時間：{item.processing_time_seconds.toFixed(1)}秒
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {item.enhanced_image_url && (
                      <button
                        onClick={() => downloadImage(
                          item.enhanced_image_url!,
                          `enhanced_${item.scale_factor}x_${item.id}.jpg`
                        )}
                        className="flex items-center justify-center bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下載
                      </button>
                    )}
                    
                    {item.error_message && (
                      <div className="bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-sm">
                        錯誤：{item.error_message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}