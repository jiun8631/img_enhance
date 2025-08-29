import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, Download, Loader2, Zap, Star, Shield, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useImageEnhancement } from '@/hooks/useImageEnhancement'
import { EnhancementType } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const { user } = useAuth()
  const { uploadImage, enhanceImage, uploading, processing } = useImageEnhancement()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [enhancementType, setEnhancementType] = useState<EnhancementType>('upscale')
  const [scaleFactor, setScaleFactor] = useState(2)
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string>('')
  const [processingStep, setProcessingStep] = useState<'idle' | 'uploading' | 'queued' | 'processing' | 'completed'>('idle')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('檔案大小不能超過 10MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('請選擇圖片檔案')
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setEnhancedImageUrl('')
      setProcessingStep('idle')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const handleEnhance = async () => {
    if (!selectedFile || !user) {
      if (!user) {
        toast.error('請先登錄後再使用')
      }
      return
    }

    try {
      setProcessingStep('uploading')
      
      // Upload image
      const uploadResult = await uploadImage(selectedFile, enhancementType, scaleFactor)
      
      setProcessingStep('queued')
      
      // Start enhancement
      const enhanceResult = await enhanceImage(uploadResult.processingId)
      
      setProcessingStep('completed')
      setEnhancedImageUrl(enhanceResult.enhancedImageUrl)
      
    } catch (error: any) {
      setProcessingStep('idle')
      console.error('Enhancement failed:', error)
    }
  }

  const downloadImage = async () => {
    if (!enhancedImageUrl) return
    
    try {
      const response = await fetch(enhancedImageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `enhanced_${scaleFactor}x_${selectedFile?.name || 'image.jpg'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('圖片下載成功')
    } catch (error) {
      toast.error('下載失敗')
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-24">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          AI 圖像精細增強器
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          使用最先進的 AI 技術，讓您的圖片更加清晰、銳利、細節更豐富
        </p>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Zap className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">AI 智能增強</h3>
            <p className="text-white/70 text-sm">基於深度學習的圖像超解析度技術</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">高品質輸出</h3>
            <p className="text-white/70 text-sm">支援 2x、4x、8x 放大，保持細節清晰</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Clock className="w-8 h-8 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">快速處理</h3>
            <p className="text-white/70 text-sm">雲端高效計算，幾分鐘內完成</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Upload className="w-6 h-6 mr-2" />
              上傳圖片
            </h2>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-400 bg-blue-400/10'
                  : 'border-white/30 hover:border-white/50 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                  />
                  <div className="text-white/80">
                    <p className="font-medium">{selectedFile?.name}</p>
                    <p className="text-sm">
                      {(selectedFile?.size! / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-12 h-12 text-white/40 mx-auto" />
                  <div className="text-white/80">
                    <p className="text-lg font-medium mb-2">
                      {isDragActive ? '放開檔案以上傳' : '點擊或拖拽圖片到此處'}
                    </p>
                    <p className="text-sm text-white/60">
                      支援 JPEG、PNG、WebP 格式，最大 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhancement Options */}
            {selectedFile && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    增強類型
                  </label>
                  <select
                    value={enhancementType}
                    onChange={(e) => setEnhancementType(e.target.value as EnhancementType)}
                    className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="upscale">超解析度放大</option>
                    <option value="denoise">降噪優化</option>
                    <option value="sharpen">銳化增強</option>
                    <option value="restore">照片修復</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    放大倍數
                  </label>
                  <select
                    value={scaleFactor}
                    onChange={(e) => setScaleFactor(parseInt(e.target.value))}
                    className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={2}>2x (快速)</option>
                    <option value={4}>4x (標準)</option>
                    <option value={8}>8x (高品質)</option>
                  </select>
                </div>

                {!user ? (
                  <Link
                    to="/login"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    登錄後開始增強
                  </Link>
                ) : (
                  <button
                    onClick={handleEnhance}
                    disabled={uploading || processing || processingStep !== 'idle'}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {processingStep === 'uploading' && (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        上傳中...
                      </>
                    )}
                    {processingStep === 'queued' && (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        排隊中...
                      </>
                    )}
                    {processingStep === 'processing' && (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        AI 處理中...
                      </>
                    )}
                    {processingStep === 'idle' && (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        開始 AI 增強
                      </>
                    )}
                    {processingStep === 'completed' && (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        再次增強
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <ImageIcon className="w-6 h-6 mr-2" />
              增強結果
            </h2>

            {enhancedImageUrl ? (
              <div className="space-y-6">
                <div className="relative">
                  <img
                    src={enhancedImageUrl}
                    alt="Enhanced"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <div className="absolute top-2 right-2 bg-green-600/90 text-white px-2 py-1 rounded text-sm font-medium">
                    {scaleFactor}x 增強
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={downloadImage}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    下載圖片
                  </button>
                  <button
                    onClick={() => {
                      setEnhancedImageUrl('')
                      setSelectedFile(null)
                      setPreviewUrl('')
                      setProcessingStep('idle')
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    重新上傳
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-white/40" />
                </div>
                <p className="text-white/60">
                  {processingStep === 'idle'
                    ? '上傳圖片並點擊增強按鈕開始處理'
                    : '正在處理您的圖片，請稍候...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}