// src/components/HomePage.tsx

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, Palette, Loader2, Copy, Download, RefreshCw, Sliders, Palette as PaletteIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import chroma from 'chroma-js'
import { motion } from 'framer-motion'
import quantize from 'quantize'

import TemplatePreview from './TemplatePreview'
import AccessibilityChecker from './AccessibilityChecker'
import GradientGenerator from './GradientGenerator'

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
      if (file.size > 5 * 1024 * 1024) { toast.error('檔案大小不能超過 5MB'); return }
      if (!file.type.startsWith('image/')) { toast.error('請選擇圖片檔案'); return }
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
      const MAX_WIDTH = 100
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

      const pixels: [number, number, number][] = []
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2]
        if (r > 250 && g > 250 && b > 250) continue
        if (r < 5 && g < 5 && b < 5) continue
        pixels.push([r, g, b])
      }

      const colorMap = quantize(pixels, 64) 
      let basePalette = colorMap ? colorMap.palette().map((rgb: [number, number, number]) => chroma(rgb).hex()) : [];

      const MIN_DISTANCE = 20 
      const distinctPalette: string[] = []
      if (basePalette.length > 0) {
        distinctPalette.push(basePalette[0])
        for (let i = 1; i < basePalette.length; i++) {
          const color = basePalette[i]
          const isDistinct = distinctPalette.every(c => chroma.distance(c, color) > MIN_DISTANCE)
          if (isDistinct) {
            distinctPalette.push(color)
          }
        }
      }

      let initialPalette = distinctPalette
        .sort(() => 0.5 - randomSeed)
        .slice(0, numColors)

      while (initialPalette.length < numColors) {
          const newColor = chroma.random().saturate(2).hex()
          if (!initialPalette.includes(newColor)) {
              initialPalette.push(newColor)
          }
      }

      let finalPalette = [...initialPalette]
      if (mode === 'complementary') {
        finalPalette = initialPalette.flatMap(color => [color, chroma(color).set('hsl.h', `+180`).hex()]).slice(0, numColors)
      } else if (mode === 'analogous') {
        finalPalette = initialPalette.flatMap(color => chroma.scale([chroma(color).set('hsl.h', `-30`), color, chroma(color).set('hsl.h', `+30`)]).mode('lch').colors(3)).slice(0, numColors)
      } else if (mode === 'triadic') {
        finalPalette = initialPalette.flatMap(color => [color, chroma(color).set('hsl.h', `+120`).hex(), chroma(color).set('hsl.h', `+240`).hex()]).slice(0, numColors)
      } else if (mode === 'morandi') {
        finalPalette = finalPalette.map(color => chroma(color).desaturate(1.5).brighten(0.3).mix('lightgray', 0.2).hex())
      } else if (mode === 'vibrant') {
        finalPalette = finalPalette.map(color => chroma(color).saturate(2).brighten(0.5).hex())
      } else if (mode === 'muted') {
        finalPalette = finalPalette.map(color => chroma(color).desaturate(2).darken(0.3).hex())
      }

      finalPalette = [...new Set(finalPalette)].slice(0, numColors);
      
      if (theme === 'warm') {
        finalPalette = finalPalette.map(color => chroma(color).set('lab.a', `+${10 + randomSeed * 10}`).hex());
      } else if (theme === 'cool') {
        finalPalette = finalPalette.map(color => chroma(color).set('lab.b', `-${10 + randomSeed * 10}`).hex());
      } else if (theme === 'pastel') {
        finalPalette = finalPalette.map(color => chroma(color).desaturate(1).brighten(1.5).hex())
      } else if (theme === 'dark') {
        finalPalette = finalPalette.map(color => chroma(color).darken(1.2).desaturate(0.5).hex())
      }
      
      finalPalette.sort((a, b) => chroma(a).luminance() - chroma(b).luminance())
      
      setPalette(finalPalette)
      toast.success('配色方案已升級！品質更精緻！')
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
    canvas.width = palette.length * 100
    canvas.height = 250
    const ctx = canvas.getContext('2d')!
    const width = 100
    palette.forEach((color, index) => {
      ctx.fillStyle = color
      ctx.fillRect(index * width, 0, width, 250)
      ctx.fillStyle = chroma.contrast(color, 'white') > 4.5 ? 'white' : 'black'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(color.toUpperCase(), index * width + width / 2, 230)
    })
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `palette-${mode}-${theme}.png`
    link.click()
    toast.success('配色圖下載成功！')
  }

  const exportCSS = () => {
    if (palette.length === 0) return
    const css = palette.map((color, index) => `  --color-${index + 1}: ${color};`).join('\n')
    navigator.clipboard.writeText(`:root {\n${css}\n}`)
    toast.success('CSS 變數已複製！')
  }

  const sharePalette = () => {
    if (palette.length === 0) return
    const shareUrl = `${window.location.origin}?palette=${encodeURIComponent(palette.join(','))}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('分享連結已複製！')
  }

  const editColor = (index: number, type: 'brightness' | 'saturation' | 'hue', delta: number) => {
    const newPalette = [...palette]
    let newColor: chroma.Color
    if (type === 'brightness') newColor = chroma(newPalette[index]).brighten(delta)
    else if (type === 'saturation') newColor = chroma(newPalette[index]).saturate(delta)
    else newColor = chroma(newPalette[index]).set('hsl.h', `+${delta}`)
    newPalette[index] = newColor.hex()
    setPalette(newPalette)
  }

  const regeneratePalette = () => generatePalette(Math.random())

  return (
    <div className="min-h-screen pb-24">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          AI 顏色配色生成器
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          專業級色彩量化演算法，從任何圖片中提取精緻、和諧且實用的配色方案。
        </p>
        <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-4 mb-8 max-w-md mx-auto">
          <div className="text-green-400 font-semibold">🎉 完全免費使用，無需註冊！</div>
          <div className="text-green-400/80 text-sm mt-1">立即上傳圖片，體驗專業級配色</div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto">
        {/* 恢復原有的 grid 佈局 */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* 【第 1 處修改：加入 transform-gpu】 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 transform-gpu">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center"><Upload className="w-6 h-6 mr-2" />上傳圖片</h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-blue-400/10' : 'border-white/30 hover:border-white/50 hover:bg-white/5'}`}>
              <input {...getInputProps()} />
              {previewUrl ? (
                <div className="space-y-4">
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg" />
                  <div className="text-white/80"><p className="font-medium">{selectedFile?.name}</p><p className="text-sm">{(selectedFile?.size! / 1024 / 1024).toFixed(2)} MB</p></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-12 h-12 text-white/40 mx-auto" />
                  <div className="text-white/80"><p className="text-lg font-medium mb-2">{isDragActive ? '放開檔案以上傳' : '點擊或拖拽圖片到此處'}</p><p className="text-sm text-white/60">支援 JPEG、PNG、WebP 格式，最大 5MB</p></div>
                </div>
              )}
            </div>
            {previewUrl && (
              <div className="mt-6 space-y-4">
                <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-2 text-white"><option value="standard">標準模式</option><option value="complementary">互補模式</option><option value="analogous">類似模式</option><option value="triadic">三色模式</option><option value="morandi">莫蘭迪</option><option value="vibrant">鮮豔模式</option><option value="muted">柔和模式</option></select>
                <select value={theme} onChange={(e) => setTheme(e.target.value as any)} className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-2 text-white"><option value="neutral">中性主題</option><option value="warm">暖色主題</option><option value="cool">冷色主題</option><option value="pastel">粉彩主題</option><option value="dark">深色主題</option></select>
                <select value={numColors} onChange={(e) => setNumColors(parseInt(e.target.value) as any)} className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-2 text-white"><option value={4}>4 種顏色</option><option value={8}>8 種顏色</option><option value={12}>12 種顏色</option><option value={16}>16 種顏色</option></select>
                <button onClick={() => generatePalette()} disabled={processing} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
                  {processing ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />生成中...</>) : (<><Palette className="w-5 h-5 mr-2" />生成配色方案</>)}
                </button>
              </div>
            )}
          </div>
          
          {/* 【第 2 處修改：加入 transform-gpu】 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 transform-gpu">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center"><PaletteIcon className="w-6 h-6 mr-2" />配色結果</h2>
            {palette.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className={`grid gap-2 sm:gap-4 grid-cols-4 ${numColors > 8 ? 'md:grid-cols-8' : 'md:grid-cols-4'}`}>
                  {palette.map((color, index) => (
                    <motion.div key={`${color}-${index}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.05 }} style={{ backgroundColor: color }} className="h-24 rounded-lg flex flex-col items-center justify-center font-mono text-sm cursor-pointer relative group" onClick={() => copyColor(color)}>
                      <span className="mb-1 p-1 bg-black/20 rounded-sm" style={{ color: chroma.contrast(color, 'white') > 4.5 ? 'white' : 'black' }}>{color}</span>
                      <Copy className="w-4 h-4 mt-1" style={{ color: chroma.contrast(color, 'white') > 4.5 ? 'white' : 'black' }} />
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 bg-black/40 rounded-full text-white hover:bg-black/60" onClick={(e) => { e.stopPropagation(); setEditingColor({ index, brightness: 0, saturation: 0, hue: 0 }); }}><Sliders className="w-4 h-4" /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {editingColor !== null && (
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <h3 className="text-white mb-4 flex items-center gap-2">編輯顏色: <span className="font-mono p-1 rounded-md" style={{ backgroundColor: palette[editingColor.index], color: chroma.contrast(palette[editingColor.index], 'white') > 2 ? 'white' : 'black' }}>{palette[editingColor.index]}</span></h3>
                    <div className="space-y-4 text-white text-sm">
                      <div><label>亮度</label><input type="range" min="-1.5" max="1.5" step="0.1" defaultValue="0" onChange={(e) => editColor(editingColor.index, 'brightness', parseFloat(e.target.value) - editingColor.brightness)} className="w-full" /></div>
                      <div><label>飽和度</label><input type="range" min="-2" max="2" step="0.1" defaultValue="0" onChange={(e) => editColor(editingColor.index, 'saturation', parseFloat(e.target.value) - editingColor.saturation)} className="w-full" /></div>
                      <div><label>色相</label><input type="range" min="-180" max="180" step="1" defaultValue="0" onChange={(e) => editColor(editingColor.index, 'hue', parseFloat(e.target.value) - editingColor.hue)} className="w-full" /></div>
                    </div>
                    <button onClick={() => setEditingColor(null)} className="mt-4 bg-red-600 hover:bg-red-700 py-1 px-3 rounded text-white text-sm">完成</button>
                  </div>
                )}
                <div className="flex gap-4 flex-wrap">
                  <button onClick={downloadPalette} className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center"><Download className="w-5 h-5 mr-2" /> 導出 PNG</button>
                  <button onClick={exportCSS} className="flex-1 min-w-[150px] bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center"><Copy className="w-5 h-5 mr-2" /> 導出 CSS</button>
                  <button onClick={regeneratePalette} className="flex-1 min-w-[150px] bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg flex items-center justify-center"><RefreshCw className="w-5 h-5 mr-2" /> 重新生成</button>
                </div>
                
                <TemplatePreview palette={palette} />
                <AccessibilityChecker palette={palette} />
                <GradientGenerator palette={palette} />

              </motion.div>
            ) : (
              <div className="text-center py-12"><div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><Palette className="w-8 h-8 text-white/40" /></div><p className="text-white/60">上傳圖片，見證專業級色彩提取</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}