import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, Palette, Loader2, Copy, Download, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import chroma from 'chroma-js'
import { motion } from 'framer-motion'  // 動畫庫

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [palette, setPalette] = useState<string[]>([])
  const [mode, setMode] = useState<'standard' | 'morandi' | 'gradient'>('standard')  // 模式選擇
  const [processing, setProcessing] = useState(false)
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('檔案大小不能超過 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('請選擇圖片檔案')
        return
      }
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setPalette([])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const generatePalette = () => {
    if (!previewUrl) return

    setProcessing(true)
    const img = new Image()
    img.src = previewUrl
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, img.width, img.height).data
      const colors = []
      const numSamples = 200 + Math.floor(Math.random() * 50)  // 隨機取樣數，讓每次變化
      const step = Math.floor(imageData.length / 4 / numSamples)
      for (let i = 0; i < imageData.length; i += step * 4) {
        const color = chroma(imageData[i], imageData[i+1], imageData[i+2]).hex()
        if (!colors.includes(color)) colors.push(color)
      }

      let finalPalette = colors.slice(0, 8)
      if (mode === 'morandi') {
        finalPalette = finalPalette.map(color => chroma(color).desaturate(1.5).brighten(0.5).hex())  // 莫蘭迪風格：低飽和、柔和
      } else if (mode === 'gradient') {
        finalPalette = chroma.scale(finalPalette).colors(8)  // 生成漸變
      }

      setPalette(finalPalette)
      toast.success('配色生成完成！')
      setProcessing(false)
    }
    img.onerror = () => {
      setProcessing(false)
      toast.error('圖片加載失敗')
    }
  }

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color)
    toast.success(`已複製 ${color}`)
  }

  const downloadPalette = () => {
    if (palette.length === 0) return
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 100
    const ctx = canvas.getContext('2d')
    const width = 400 / palette.length
    palette.forEach((color, index) => {
      ctx.fillStyle = color
      ctx.fillRect(index * width, 0, width, 100)
    })
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `${mode}-palette.png`
    link.click()
    toast.success('配色板下載成功！')
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          AI 顏色配色生成器
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          從圖片提取主色，支持標準、莫蘭迪、漸變模式 - 專業設計工具
        </p>
        
        {/* Free Notice */}
        <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-4 mb-8 max-w-md mx-auto">
          <div className="text-green-400 font-semibold">
            🎉 完全免費使用，無需註冊！
          </div>
          <div className="text-green-400/80 text-sm mt-1">
            立即上傳圖片開始生成配色
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
                      支援 JPEG、PNG、WebP 格式，最大 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {previewUrl && (
              <div className="mt-6 space-y-4">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as typeof mode)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="standard">標準模式</option>
                  <option value="morandi">莫蘭迪模式</option>
                  <option value="gradient">漸變模式</option>
                </select>
                <button
                  onClick={generatePalette}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Palette className="w-5 h-5 mr-2" />
                      生成配色方案
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Palette className="w-6 h-6 mr-2" />
              配色結果 ({mode})
            </h2>

            {palette.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  {palette.map((color, index) => (
                    <motion.div key={index} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.1 }} style={{ backgroundColor: color }} className="h-24 rounded-lg flex items-center justify-center text-black font-medium text-sm cursor-pointer" onClick={() => copyColor(color)}>
                      {color} <Copy className="w-4 h-4 ml-1" />
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <button onClick={downloadPalette} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 mr-2" /> 導出配色板
                  </button>
                  <button onClick={generatePalette} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2" /> 重新生成
                  </button>
                  <button
                    onClick={() => {
                      setPalette([])
                      setSelectedFile(null)
                      setPreviewUrl('')
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                  >
                    重新上傳
                  </button>
                </div>

                {/* 配色預覽 (樣本 UI) */}
                <div className="mt-8 p-4 bg-gray-900 rounded-lg">
                  <h3 className="text-white mb-2">預覽應用</h3>
                  <div style={{ backgroundColor: palette[0], color: chroma(palette[0]).darken().hex() }} className="p-4 rounded">
                    背景色: {palette[0]}
                  </div>
                  <button style={{ backgroundColor: palette[1], color: chroma(palette[1]).darken().hex() }} className="mt-2 p-2 rounded">
                    按鈕色: {palette[1]}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-white/40" />
                </div>
                <p className="text-white/60">
                  上傳圖片並點擊生成按鈕開始
                </p>
              </div>
            )}

            {/* Adsense 廣告位 (替換為你的代碼) */}
            <div className="mt-8 bg-gray-800/90 rounded-xl p-6">
              <div className="text-center text-gray-400 text-sm mb-2">
                廣告區域
              </div>
              <ins className="adsbygoogle"
                   style={{ display: "block" }}
                   data-ad-client="ca-pub-XXXXX"  // 替換為你的 Adsense ca-pub ID
                   data-ad-slot="XXXXX"  // 替換為你的廣告槽 ID
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}