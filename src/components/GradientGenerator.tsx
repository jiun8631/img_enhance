// src/components/GradientGenerator.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Copy, Layers, Download, Droplet, RefreshCw, Wand2, AlignHorizontalJustifyCenter } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng } from 'html-to-image'
import chroma from 'chroma-js'

interface GradientGeneratorProps {
  palette: string[];
}

type GradientColor = {
  id: string;
  color: string;
  stop: number;
}

// 【新】將漸層設定統一管理
type GradientConfig = {
  type: 'linear' | 'radial' | 'conic';
  angle: number; // for linear and conic
  position: string; // for radial and conic
}

const GradientGenerator: React.FC<GradientGeneratorProps> = ({ palette }) => {
  const [gradientColors, setGradientColors] = useState<GradientColor[]>([])
  const [gradientConfig, setGradientConfig] = useState<GradientConfig>({
    type: 'linear',
    angle: 90,
    position: 'center',
  })
  const [gradientCSS, setGradientCSS] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  const generateRandomGradient = useCallback(() => {
    if (palette.length < 2) return;

    // 1. 隨機選取 3 到 5 種顏色
    const shuffled = [...palette].sort(() => 0.5 - Math.random());
    const numColors = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5 colors
    const selected = shuffled.slice(0, numColors);
    
    // 關鍵：重新按亮度排序，確保過渡自然
    selected.sort((a,b) => chroma(a).luminance() - chroma(b).luminance());

    // 2. 隨機選擇漸層類型
    const types: GradientConfig['type'][] = ['linear', 'radial', 'conic'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    // 3. 隨機化參數
    const randomAngle = Math.floor(Math.random() * 360);
    const positions = ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'];
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    
    setGradientConfig({ type: randomType, angle: randomAngle, position: randomPosition });
    
    // 4. 生成顏色並"完美"分佈
    const newGradientColors = selected.map((color, index) => ({
      id: `${color}-${Date.now()}-${index}`,
      color,
      // 關鍵：自動計算平滑的 stop 位置！
      stop: Math.round((index / (selected.length - 1)) * 100),
    }));

    setGradientColors(newGradientColors);
    toast.success('魔法已施展！新漸層已生成 ✨');
  }, [palette]);


  // 【優化】當外部 palette 改變時，自動觸發一次隨機生成
  useEffect(() => {
    if (palette.length >= 2) {
      generateRandomGradient();
    } else {
      setGradientColors([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette]);
  
  // 當漸層設定改變時，重新生成 CSS
  useEffect(() => {
    if (gradientColors.length < 2) {
      setGradientCSS('/* 請至少選擇兩種顏色來生成漸層 */');
      return;
    }
    const sortedColors = [...gradientColors].sort((a, b) => a.stop - b.stop);
    const colorStops = sortedColors.map(c => `${c.color} ${c.stop}%`).join(', ');

    let css = '';
    switch (gradientConfig.type) {
      case 'linear':
        css = `linear-gradient(${gradientConfig.angle}deg, ${colorStops})`;
        break;
      case 'radial':
        css = `radial-gradient(circle at ${gradientConfig.position}, ${colorStops})`;
        break;
      case 'conic':
        css = `conic-gradient(from ${gradientConfig.angle}deg at ${gradientConfig.position}, ${colorStops})`;
        break;
    }
    setGradientCSS(css);
  }, [gradientColors, gradientConfig]);

  const handleColorToggle = (color: string) => {
    const existingColor = gradientColors.find(c => c.color === color);
    if (existingColor) {
      setGradientColors(gradientColors.filter(c => c.id !== existingColor.id));
    } else {
      const newColor: GradientColor = {
        id: `${color}-${Date.now()}`,
        color: color,
        stop: 50,
      };
      setGradientColors([...gradientColors, newColor]);
    }
  };
  
  // 【新功能】智慧輔助：將當前選中顏色均勻分佈
  const distributeStopsEvenly = () => {
    if (gradientColors.length < 2) {
      toast.error('請至少選擇兩種顏色');
      return;
    }
    const sortedByPaletteOrder = [...gradientColors].sort((a, b) => palette.indexOf(a.color) - palette.indexOf(b.color));
    const evenlyDistributed = sortedByPaletteOrder.map((color, index) => ({
      ...color,
      stop: Math.round((index / (sortedByPaletteOrder.length - 1)) * 100),
    }));
    setGradientColors(evenlyDistributed);
    toast.success('顏色已均勻分佈');
  };

  const handleStopChange = (id: string, newStop: number) => {
    setGradientColors(
      gradientColors.map(c => (c.id === id ? { ...c, stop: newStop } : c))
    );
  };
  
  const copyCSS = () => {
    if (gradientColors.length < 2) return;
    const fullCSS = `background: ${gradientCSS};`
    navigator.clipboard.writeText(fullCSS)
    toast.success('漸層 CSS 已複製！')
  }

  // 【修復導出】
  const handleDownloadImage = useCallback(() => {
    if (previewRef.current === null || gradientColors.length < 2) return;
    toast.loading('正在生成圖片...', { id: 'download-gradient' });
    toPng(previewRef.current, { 
      cacheBust: true, 
      pixelRatio: 2,
      // 關鍵修復：在生成圖片時，強制移除邊框和圓角
      style: {
        borderRadius: '0',
        border: 'none',
      }
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `gradient-${gradientConfig.type}.png`;
        link.href = dataUrl;
        link.click();
        toast.success('漸層圖片下載成功！', { id: 'download-gradient' });
      })
      .catch((err) => {
        toast.error('圖片生成失敗', { id: 'download-gradient' });
        console.error('oops, something went wrong!', err);
      });
  }, [previewRef, gradientColors, gradientConfig.type]);


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
          魔法漸層產生器
        </h3>
        <button onClick={generateRandomGradient} className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors" aria-label="隨機生成漸層">
          <Wand2 className="w-5 h-5" />
        </button>
      </div>
      
      <div 
        ref={previewRef}
        className="w-full h-40 rounded-lg mb-4 border border-white/10 transition-all"
        style={{ background: gradientCSS }}
      />
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-white/80">選擇顏色</label>
            <button onClick={distributeStopsEvenly} className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors" disabled={gradientColors.length < 2}>
                <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                均勻分佈
            </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {palette.map(color => {
            const isSelected = gradientColors.some(c => c.color === color);
            return (
              <motion.button key={color} onClick={() => handleColorToggle(color)} className={`w-10 h-10 rounded-md border-2 transition-all duration-200 relative ${isSelected ? 'border-cyan-400 scale-110' : 'border-transparent hover:border-white/50'}`} style={{ backgroundColor: color }} whileTap={{ scale: 0.9 }} aria-label={`選擇顏色 ${color}`}>
                {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center"><Droplet className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 0 2px black)' }} /></motion.div>}
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">類型</label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setGradientConfig(c => ({...c, type: 'linear'}))} className={`py-2 px-4 rounded-md text-sm transition-colors ${gradientConfig.type === 'linear' ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'}`}>線性</button>
            <button onClick={() => setGradientConfig(c => ({...c, type: 'radial'}))} className={`py-2 px-4 rounded-md text-sm transition-colors ${gradientConfig.type === 'radial' ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'}`}>徑向</button>
            <button onClick={() => setGradientConfig(c => ({...c, type: 'conic'}))} className={`py-2 px-4 rounded-md text-sm transition-colors ${gradientConfig.type === 'conic' ? 'bg-teal-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'}`}>圓錐</button>
          </div>
        </div>
        <AnimatePresence>
        {(gradientConfig.type === 'linear' || gradientConfig.type === 'conic') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <label htmlFor="angle" className="block text-sm font-medium text-white/80 mb-2">角度: {gradientConfig.angle}°</label>
              <input id="angle" type="range" min="0" max="360" value={gradientConfig.angle} onChange={(e) => setGradientConfig(c => ({...c, angle: Number(e.target.value)}))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
            </motion.div>
        )}
        </AnimatePresence>
      </div>

      <div className="space-y-3 mb-6">
        <AnimatePresence>
        {[...gradientColors].sort((a,b) => palette.indexOf(a.color) - palette.indexOf(b.color)).map(({ id, color, stop }) => (
            <motion.div key={id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: color }} />
              <input type="range" min="0" max="100" value={stop} onChange={(e) => handleStopChange(id, Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" style={{accentColor: color}} />
              <span className="font-mono text-sm text-white w-10 text-right">{stop}%</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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