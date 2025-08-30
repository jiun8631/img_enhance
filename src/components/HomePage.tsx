// src/components/HomePage.tsx

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, Palette, Loader2, Copy, Download, RefreshCw, Sliders, Palette as PaletteIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import chroma from 'chroma-js'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [palette, setPalette] = useState<string[]>([])
  const [mode, setMode] = useState<'standard' | 'complementary' | 'analogous' | 'triadic' | 'morandi' | 'vibrant' | 'muted'>('standard')
  const [theme, setTheme] = useState<'neutral' | 'warm' | 'cool' | 'pastel' | 'dark'>('neutral')
  const [numColors, setNumColors] = useState<4 | 8 | 12 | 16>(8)
  const [processing, setProcessing] = useState(false)
  const [editingColor, setEditingColor] = useState<{ index: number, brightness: number, saturation: number, hue: number } | null>(null)

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
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false
  })
  
  // ===================================================================================
  // 【核心升級】: 重寫 generatePalette 函數，採用更智能的顏色提取演算法
  // ===================================================================================
  const generatePalette = (randomSeed = Math.random()) => {
    if (!previewUrl) {
      toast.error('請先選擇圖片')
      return
    }

    setProcessing(true)
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = previewUrl
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX_WIDTH = 150 // 限制採樣寬度以提高性能
      canvas.width = Math.min(MAX_WIDTH, img.width)
      canvas.height = Math.floor(img.height * canvas.width / img.width)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setProcessing(false)
        toast.error('瀏覽器不支持')
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      const colorCounts = new Map<string, number>()

      // 步驟 1: 採樣像素並過濾掉"無聊"的顏色 (太黑、太白、太灰)
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i]
        const g = imageData[i + 1]
        const b = imageData[i + 2]
        const hsl = chroma(r, g, b).hsl()

        // 過濾條件: 飽和度 > 10%, 亮度在 5% 到 95% 之間
        if (hsl[1] > 0.1 && hsl[2] > 0.05 && hsl[2] < 0.95) {
          const key = `${r},${g},${b}`
          colorCounts.set(key, (colorCounts.get(key) || 0) + 1)
        }
      }

      // 步驟 2: 色相分桶 (Hue Bucketing) - 確保顏色多樣性
      const HUE_BUCKETS = 12 // 將 360 度色相環分為 12 個桶 (每個 30 度)
      const buckets = Array.from({ length: HUE_BUCKETS }, () => [] as { color: string, count: number, saturation: number }[])

      for (const [key, count] of colorCounts.entries()) {
        const [r, g, b] = key.split(',').map(Number)
        const color = chroma(r, g, b)
        const hue = color.hsl()[0]
        const saturation = color.hsl()[1]
        
        // 如果色相是 NaN (例如灰色)，則跳過
        if (isNaN(hue)) continue;

        const bucketIndex = Math.floor(hue / (360 / HUE_BUCKETS))
        buckets[bucketIndex].push({ color: color.hex(), count, saturation })
      }

      // 步驟 3: 從每個桶中選出最有代表性的顏色
      const representativeColors: { color: string, count: number }[] = []
      buckets.forEach(bucket => {
        if (bucket.length > 0) {
          // 在每個桶中，按像素數量排序，選出最多的那個
          bucket.sort((a, b) => b.count - a.count)
          representativeColors.push({ color: bucket[0].color, count: bucket[0].count })
        }
      })

      // 步驟 4: 補充顏色 - 如果桶選出的顏色不夠，從整體最頻繁的顏色中補充
      if (representativeColors.length < numColors) {
          const sortedAllColors = Array.from(colorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([key]) => chroma(key.split(',').map(Number) as [number, number, number]).hex());
          
          for (const color of sortedAllColors) {
              if (representativeColors.length >= numColors) break;
              if (!representativeColors.some(rc => rc.color === color)) {
                  representativeColors.push({ color, count: 0 }); // count 不重要了
              }
          }
      }

      // 步驟 5: 根據代表性（出現頻率）對選出的顏色進行最終排序，並選取所需數量
      representativeColors.sort((a, b) => b.count - a.count)
      let initialPalette = representativeColors.map(c => c.color).slice(0, numColors);

      // 步驟 6: 應用模式和主題 (這部分邏輯保持不變)
      let finalPalette = [...initialPalette];

      if (mode === 'complementary') {
        finalPalette = initialPalette.flatMap(color => [color, chroma(color).set('hsl.h', `+180`).hex()]).slice(0, numColors)
      } else if (mode === 'analogous') {
        finalPalette = initialPalette.flatMap(color => chroma.scale([chroma(color).set('hsl.h', `-30`), color, chroma(color).set('hsl.h', `+30`)]).mode('lch').colors(3)).slice(0, numColors)
      } else if (mode === 'triadic') {
        finalPalette = initialPalette.flatMap(color => [color, chroma(color).set('hsl.h', `+120`).hex(), chroma(color).set('hsl.h', `+240`).hex()]).slice(0, numColors)
      } else if (mode === 'morandi') {
        finalPalette = initialPalette.map(color => chroma(color).desaturate(1.5).brighten(0.3).mix('lightgray', 0.2).hex())
      } else if (mode === 'vibrant') {
        finalPalette = initialPalette.map(color => chroma(color).saturate(2).brighten(0.5).hex())
      } else if (mode === 'muted') {
        finalPalette = initialPalette.map(color => chroma(color).desaturate(2).darken(0.3).hex())
      }

      finalPalette = [...new Set(finalPalette)].slice(0, numColors);

      while (finalPalette.length < numColors) {
        const base = finalPalette[Math.floor(randomSeed * finalPalette.length)] || chroma.random().hex()
        finalPalette.push(chroma(base).set('hsl.h', `+${(randomSeed - 0.5) * 60}`).hex())
      }
      
      if (theme === 'warm') {
        finalPalette = finalPalette.map(color => chroma(color).set('lab.a', `+${10 + randomSeed * 10}`).hex());
      } else if (theme === 'cool') {
        finalPalette = finalPalette.map(color => chroma(color).set('lab.b', `-${10 + randomSeed * 10}`).hex());
      } else if (theme === 'pastel') {
        finalPalette = finalPalette.map(color => chroma(color).desaturate(1).brighten(1.5).hex())
      } else if (theme === 'dark') {
        finalPalette = finalPalette.map(color => chroma(color).darken(1.2).desaturate(0.5).hex())
      }
      
      // 最終排序，以亮度排序，便於查看
      finalPalette.sort((a, b) => chroma(a).luminance() - chroma(b).luminance())
      
      setPalette(finalPalette)
      toast.success('配色生成完成！演算法已升級，更多樣！')
      setProcessing(false)
    }
    img.onerror = () => {
      setProcessing(false)
      toast.error('圖片加載失敗')
    }
  }
  // ===================================================================================
  // 演算法升級結束
  // ===================================================================================

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color)
    toast.success(`已複製 ${color}`)
  }

  const downloadPalette = () => {
    if (palette.length === 0) return
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 200
    const ctx = canvas.getContext('2d')!
    const width = 800 / palette.length
    palette.forEach((color, index) => {
      ctx.fillStyle = color
      ctx.fillRect(index * width, 0, width, 200)
      ctx.fillStyle = chroma.contrast(color, 'white') > 4.5 ? 'white' : 'black'
      ctx.font = '12px Arial'
      ctx.fillText(color, index * width + 10, 180)
    })
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `${mode}-${theme}-palette.png`
    link.click()
    toast.success('配色板下載成功！')
  }

  const exportCSS = () => {
    if (palette.length === 0) return
    const css = palette.map((color, index) => `--color-${index + 1}: ${color};`).join('\n')
    navigator.clipboard.writeText(`:root {\n${css}\n}`)
    toast.success('CSS 代碼已複製！')
  }

  const sharePalette = () => {
    if (palette.length === 0) return
    const shareUrl = `${window.location.origin}?palette=${encodeURIComponent(palette.join(','))}&mode=${mode}&theme=${theme}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('分享連結已複製！')
  }

  const editColor = (index: number, type: 'brightness' | 'saturation' | 'hue', delta: number) => {
    const newPalette = [...palette]
    let newColor = chroma(newPalette[index])
    if (type === 'brightness') newColor = newColor.brighten(delta)
    if (type === 'saturation') newColor = newColor.saturate(delta)
    if (type === 'hue') newColor = newColor.set('hsl.h', chroma(newPalette[index]).get('hsl.h') + delta)
    newPalette[index] = newColor.hex()
    setPalette(newPalette)
  }

  const regeneratePalette = () => {
    generatePalette(Math.random())
  }


  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          AI 顏色配色生成器
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          智能提取並生成和諧配色，支持多模式、主題和進階編輯 - 設計師必備工具
        </p>
        
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
                  <option value="complementary">互補模式</option>
                  <option value="analogous">類似模式</option>
                  <option value="triadic">三色模式</option>
                  <option value="morandi">莫蘭迪模式</option>
                  <option value="vibrant">鮮豔模式</option>
                  <option value="muted">柔和模式</option>
                </select>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as typeof theme)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="neutral">中性主題</option>
                  <option value="warm">暖色主題</option>
                  <option value="cool">冷色主題</option>
                  <option value="pastel">粉彩主題</option>
                  <option value="dark">深色主題</option>
                </select>
                <select
                  value={numColors}
                  onChange={(e) => setNumColors(parseInt(e.target.value) as typeof numColors)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value={4}>4 種顏色</option>
                  <option value={8}>8 種顏色</option>
                  <option value={12}>12 種顏色</option>
                  <option value={16}>16 種顏色</option>
                </select>
                <button
                  onClick={() => generatePalette()}
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
              <PaletteIcon className="w-6 h-6 mr-2" />
              配色結果 ({mode} - {theme} - {numColors} 種)
            </h2>

            {palette.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
                <div className={`grid grid-cols-4 md:grid-cols-${Math.min(numColors, 8)} gap-4`}>
                  {palette.map((color, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ delay: index * 0.05 }} 
                      style={{ backgroundColor: color }} 
                      className="h-24 rounded-lg flex flex-col items-center justify-center text-black font-medium text-sm cursor-pointer relative group" 
                      onClick={() => copyColor(color)}
                    >
                      <span className="mb-1" style={{ color: chroma.contrast(color, 'white') > 4.5 ? 'white' : 'black' }}>{color}</span>
                      <Copy className="w-4 h-4" style={{ color: chroma.contrast(color, 'white') > 4.5 ? 'white' : 'black' }} />
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sliders className="w-4 h-4 text-white p-0.5 bg-black/30 rounded" onClick={(e) => {
                          e.stopPropagation()
                          setEditingColor({ index: index, brightness: 0, saturation: 0, hue: 0 })
                        }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {editingColor !== null && (
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <h3 className="text-white mb-2">編輯顏色: <span className="font-mono p-1 rounded" style={{backgroundColor: palette[editingColor.index]}}>{palette[editingColor.index]}</span></h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white block mb-1">亮度</label>
                        <input type="range" min="-1.5" max="1.5" step="0.1" defaultValue="0" onChange={(e) => editColor(editingColor.index, 'brightness', parseFloat(e.target.value))} className="w-full" />
                      </div>
                      <div>
                        <label className="text-white block mb-1">飽和度</label>
                        <input type="range" min="-1.5" max="1.5" step="0.1" defaultValue="0" onChange={(e) => editColor(editingColor.index, 'saturation', parseFloat(e.target.value))} className="w-full" />
                      </div>
                      <div>
                        <label className="text-white block mb-1">色相</label>
                        <input type="range" min="-180" max="180" step="1" defaultValue="0" onChange={(e) => editColor(editingColor.index, 'hue', parseFloat(e.target.value))} className="w-full" />
                      </div>
                    </div>
                    <button onClick={() => setEditingColor(null)} className="mt-4 bg-red-600 hover:bg-red-700 py-1 px-3 rounded text-white">關閉</button>
                  </div>
                )}
                
                <div className="flex gap-4 flex-wrap">
                  <button onClick={downloadPalette} className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 mr-2" /> 導出 PNG
                  </button>
                  <button onClick={exportCSS} className="flex-1 min-w-[150px] bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center">
                    <Copy className="w-5 h-5 mr-2" /> 導出 CSS
                  </button>
                  <button onClick={sharePalette} className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2" /> 分享連結
                  </button>
                  <button onClick={regeneratePalette} className="flex-1 min-w-[150px] bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2" /> 重新生成
                  </button>
                </div>

                <p className="text-white/80 text-sm">靈感提示: 這些顏色適合 {mode === 'complementary' ? '高對比設計' : mode === 'analogous' ? '柔和界面' : mode === 'triadic' ? '動態配色' : mode === 'morandi' ? '精緻柔和設計' : mode === 'vibrant' ? '活力亮色應用' : mode === 'muted' ? '低調優雅風格' : '平衡配色'}。嘗試不同主題以獲得更多變化。重新生成將產生略微不同的變體。</p>
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

            <div className="mt-8 bg-gray-800/90 rounded-xl p-6">
              <div className="text-center text-gray-400 text-sm mb-2">
                廣告區域
              </div>
              <ins className="adsbygoogle"
                   style={{ display: "block" }}
                   data-ad-client="ca-pub-XXXXX"
                   data-ad-slot="XXXXX"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              {/* <script>(adsbygoogle = window.adsbygoogle || []).push({});</script> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}