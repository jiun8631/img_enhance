// src/components/GradientGenerator.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Copy, Layers, Download, Wand2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng } from 'html-to-image'
import chroma from 'chroma-js'

interface GradientGeneratorProps {
  palette: string[];
}

type GradientConfig = {
  type: 'linear' | 'radial' | 'conic' | 'mesh';
  angle: number;
  position: string;
}

const GradientGenerator: React.FC<GradientGeneratorProps> = ({ palette }) => {
  const [gradientCSS, setGradientCSS] = useState('')
  const [isMesh, setIsMesh] = useState(false)
  const [gradientConfig, setGradientConfig] = useState<GradientConfig>({
    type: 'linear', angle: 90, position: 'center'
  })
  
  const previewRef = useRef<HTMLDivElement>(null);

  const generateRandomGradient = useCallback(() => {
    if (palette.length < 3) {
      if (palette.length > 0) toast.error("需要至少3種顏色來施展魔法");
      return;
    };

    const shuffled = [...palette].sort(() => 0.5 - Math.random());
    const numColors = Math.min(palette.length, Math.floor(Math.random() * 3) + 3);
    const selected = shuffled.slice(0, numColors);
    
    const shouldCreateMesh = Math.random() > 0.4;
    setIsMesh(shouldCreateMesh);

    if (shouldCreateMesh) {
      const meshLayers = selected.map(color => {
        const size = Math.floor(Math.random() * 60) + 40;
        const posX = Math.floor(Math.random() * 101);
        const posY = Math.floor(Math.random() * 101);
        const transparentColor = chroma(color).alpha(0).css();
        return `radial-gradient(circle at ${posX}% ${posY}%, ${color} 0%, ${transparentColor} ${size}%)`;
      });
      const bgColor = chroma.average(selected, 'lch').hex();
      setGradientConfig({ type: 'mesh', angle: 0, position: 'center' });
      setGradientCSS(`${meshLayers.join(', ')}, radial-gradient(circle, ${bgColor}, ${chroma(bgColor).darken(1).hex()})`);
      toast.success('網格魔法已施展！效果華麗！ ✨');
    } else {
      selected.sort((a,b) => chroma(a).luminance() - chroma(b).luminance());
      const smoothPalette = chroma.scale(selected).mode('lch').colors(10);
      const types: GradientConfig['type'][] = ['linear', 'radial', 'conic'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomAngle = Math.floor(Math.random() * 360);
      const positions = ['center', 'top', 'bottom', 'left', 'right'];
      const randomPosition = positions[Math.floor(Math.random() * positions.length)];
      setGradientConfig({ type: randomType, angle: randomAngle, position: randomPosition });
      let css = '';
      const colorStops = smoothPalette.map((c, i) => `${c} ${i * (100 / 9)}%`).join(', ');
       switch (randomType) {
        case 'linear': css = `linear-gradient(${randomAngle}deg, ${colorStops})`; break;
        case 'radial': css = `radial-gradient(circle at ${randomPosition}, ${colorStops})`; break;
        case 'conic': css = `conic-gradient(from ${randomAngle}deg at ${randomPosition}, ${colorStops})`; break;
      }
      setGradientCSS(css);
      toast.success('絲滑漸層已生成！🎨');
    }
  }, [palette]);

  useEffect(() => {
    if (palette.length > 2) {
      generateRandomGradient();
    } else {
      setGradientCSS('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette]);
  
  const copyCSS = () => {
    if (!gradientCSS) return;
    navigator.clipboard.writeText(`background: ${gradientCSS};`);
    toast.success('漸層 CSS 已複製！');
  }

  const handleDownloadImage = useCallback(() => {
    if (previewRef.current === null) {
      toast.error('無法找到預覽元素');
      return;
    }
    if (!gradientCSS) {
        toast.error('沒有可導出的漸層');
        return;
    }
    toast.loading('正在生成高清圖片...', { id: 'download-gradient' });
    toPng(previewRef.current, { 
      cacheBust: true, 
      width: 1920,
      height: 1080,
      pixelRatio: 1, 
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
        toast.success('1080p 漸層圖片下載成功！', { id: 'download-gradient' });
      })
      .catch((err) => {
        toast.error('圖片生成失敗，請再試一次', { id: 'download-gradient' });
        console.error('oops, something went wrong!', err);
      });
  }, [gradientCSS, gradientConfig.type]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 bg-gray-900/50 p-6 rounded-xl border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Layers className="w-5 h-5 mr-3 text-cyan-400" />
          AI 魔法漸層產生器
        </h3>
        <button onClick={generateRandomGradient} className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors flex items-center gap-2 pl-4" aria-label="隨機生成漸層">
          <Wand2 className="w-5 h-5" />
          <span className="text-sm font-semibold pr-2">施展魔法</span>
        </button>
      </div>
      
      <div ref={previewRef} className="w-full h-48 rounded-lg mb-4 border border-white/10 transition-all bg-gray-900" style={{ background: gradientCSS }} />
      
      <AnimatePresence>
        {isMesh && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
             <div className="bg-purple-900/20 border border-purple-500/30 text-purple-300 text-sm p-3 rounded-lg mb-4">
               <b>網格漸層模式：</b>此模式下無法手動微調。再次點擊「施展魔法」來探索更多驚喜。
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 【這就是終極修復！】 */}
      <div className="relative bg-black/50 p-4 rounded-md font-mono text-sm text-cyan-300 border border-white/10 mb-4 overflow-x-auto">
        {/* 從 `whitespace-nowrap` 改為 `break-all` */}
        <code className="break-all"><span className="text-purple-400">background</span>: {gradientCSS};</code>
        <button onClick={copyCSS} className="absolute top-2 right-2 p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-md transition-colors" aria-label="複製 CSS"><Copy className="w-4 h-5" /></button>
      </div>
      <button onClick={handleDownloadImage} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
        <Download className="w-5 h-5 mr-2" />
        導出為 1080p 高清圖片
      </button>
    </motion.div>
  )
}

export default GradientGenerator;