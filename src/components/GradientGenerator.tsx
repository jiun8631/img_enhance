// src/components/GradientGenerator.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Copy, Layers, Download, Droplet, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng } from 'html-to-image'

interface GradientGeneratorProps {
  palette: string[];
}

type GradientColor = {
  id: string;
  color: string;
  stop: number;
}

const GradientGenerator: React.FC<GradientGeneratorProps> = ({ palette }) => {
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear')
  const [angle, setAngle] = useState(90)
  const [gradientColors, setGradientColors] = useState<GradientColor[]>([])
  const [gradientCSS, setGradientCSS] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  // 當外部傳入的 palette 改變時，初始化漸層顏色
  useEffect(() => {
    if (palette.length >= 2) {
      // 預設選取最暗和最亮的顏色，創造最大對比
      const firstColor = palette[0];
      const lastColor = palette[palette.length - 1];
      setGradientColors([
        { id: `${firstColor}-${Date.now()}`, color: firstColor, stop: 0 },
        { id: `${lastColor}-${Date.now() + 1}`, color: lastColor, stop: 100 },
      ]);
    } else {
      setGradientColors([]);
    }
  }, [palette]);
  
  // 當漸層設定改變時，重新生成 CSS
  useEffect(() => {
    if (gradientColors.length < 2) {
      setGradientCSS('/* 請至少選擇兩種顏色來生成漸層 */');
      return;
    }
    // 必須按 stop 排序，CSS 漸層才正確
    const sortedColors = [...gradientColors].sort((a, b) => a.stop - b.stop);
    const colorStops = sortedColors.map(c => `${c.color} ${c.stop}%`).join(', ');

    let css = '';
    if (gradientType === 'linear') {
      css = `linear-gradient(${angle}deg, ${colorStops})`;
    } else {
      css = `radial-gradient(circle, ${colorStops})`;
    }
    setGradientCSS(css);
  }, [gradientColors, gradientType, angle]);

  const handleColorToggle = (color: string) => {
    const existingColor = gradientColors.find(c => c.color === color);
    if (existingColor) {
      // 如果顏色已存在，則移除
      setGradientColors(gradientColors.filter(c => c.id !== existingColor.id));
    } else {
      // 如果顏色不存在，則加入
      const newColor: GradientColor = {
        id: `${color}-${Date.now()}`,
        color: color,
        stop: 50, // 預設加在中間位置
      };
      setGradientColors([...gradientColors, newColor]);
    }
  };

  const handleStopChange = (id: string, newStop: number) => {
    setGradientColors(
      gradientColors.map(c => (c.id === id ? { ...c, stop: newStop } : c))
    );
  };

  const copyCSS = () => {
    if (gradientColors.length < 2) {
      toast.error('顏色不足，無法複製 CSS');
      return;
    }
    const fullCSS = `background: ${gradientCSS};`
    navigator.clipboard.writeText(fullCSS)
    toast.success('漸層 CSS 已複製！')
  }

  const handleDownloadImage = useCallback(() => {
    if (previewRef.current === null || gradientColors.length < 2) {
      toast.error('無法生成圖片，請先選擇漸層顏色');
      return;
    }
    toast.loading('正在生成圖片...', { id: 'download-gradient' });
    toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `gradient-${gradientType}.png`;
        link.href = dataUrl;
        link.click();
        toast.success('漸層圖片下載成功！', { id: 'download-gradient' });
      })
      .catch((err) => {
        toast.error('圖片生成失敗，請稍後再試', { id: 'download-gradient' });
        console.error('oops, something went wrong!', err);
      });
  }, [previewRef, gradientColors, gradientType]);

  const resetGradient = () => {
     if (palette.length >= 2) {
      const firstColor = palette[0];
      const lastColor = palette[palette.length - 1];
      setGradientColors([
        { id: `${firstColor}-${Date.now()}`, color: firstColor, stop: 0 },
        { id: `${lastColor}-${Date.now() + 1}`, color: lastColor, stop: 100 },
      ]);
      toast.success('漸層已重設');
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 bg-gray-900/50 p-6 rounded-xl border border-white/20"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Layers className="w-5 h-5 mr-3 text-cyan-400" />
          進階漸層產生器
        </h3>
        <button onClick={resetGradient} className="p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-md transition-colors" aria-label="重設漸層">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {/* 漸層預覽 */}
      <div 
        ref={previewRef}
        className="w-full h-40 rounded-lg mb-4 border border-white/10 transition-all"
        style={{ background: gradientCSS }}
      />
      
      {/* 1. 顏色選擇區 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/80 mb-2">選擇顏色</label>
        <div className="flex flex-wrap gap-2">
          {palette.map(color => {
            const isSelected = gradientColors.some(c => c.color === color);
            return (
              <motion.button
                key={color}
                onClick={() => handleColorToggle(color)}
                className={`w-10 h-10 rounded-md border-2 transition-all duration-200 relative ${isSelected ? 'border-cyan-400 scale-110' : 'border-transparent hover:border-white/50'}`}
                style={{ backgroundColor: color }}
                whileTap={{ scale: 0.9 }}
                aria-label={`選擇顏色 ${color}`}
              >
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 0 2px black)' }} />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* 2. 漸層屬性控制 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">類型</label>
          <div className="flex gap-2">
            <button onClick={() => setGradientType('linear')} className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${gradientType === 'linear' ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'}`}>線性</button>
            <button onClick={() => setGradientType('radial')} className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${gradientType === 'radial' ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'}`}>徑向</button>
          </div>
        </div>
        <AnimatePresence>
          {gradientType === 'linear' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <label htmlFor="angle" className="block text-sm font-medium text-white/80 mb-2">角度: {angle}°</label>
              <input id="angle" type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. 顏色位置控制 (擴散程度) */}
      <div className="space-y-3 mb-6">
        <AnimatePresence>
        {[...gradientColors].sort((a,b) => palette.indexOf(a.color) - palette.indexOf(b.color)).map(({ id, color, stop }) => (
            <motion.div 
              key={id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: color }} />
              <span className="font-mono text-sm text-white/80">{color}</span>
              <input type="range" min="0" max="100" value={stop} onChange={(e) => handleStopChange(id, Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" style={{accentColor: color}} />
              <span className="font-mono text-sm text-white w-10 text-right">{stop}%</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. 導出與複製 */}
      <div className="relative bg-black/50 p-4 rounded-md font-mono text-sm text-cyan-300 border border-white/10 mb-4">
        <code><span className="text-purple-400">background</span>: {gradientCSS};</code>
        <button onClick={copyCSS} className="absolute top-2 right-2 p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-md transition-colors" aria-label="複製 CSS"><Copy className="w-4 h-4" /></button>
      </div>
      <button onClick={handleDownloadImage} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
        <Download className="w-5 h-5 mr-2" />
        導出為 PNG 圖片
      </button>
    </motion.div>
  )
}

export default GradientGenerator;