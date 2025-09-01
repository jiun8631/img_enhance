// src/components/GradientGenerator.tsx

import React, { useState, useEffect, useCallback } from 'react'
import { Copy, Layers, Download, Wand2, AlignHorizontalJustifyCenter } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng } from 'html-to-image'
import chroma from 'chroma-js'

interface GradientGeneratorProps {
  palette: string[];
}

type GradientConfig = {
  type: 'linear' | 'radial' | 'conic';
  angle: number;
  position: string;
}

const GradientGenerator: React.FC<GradientGeneratorProps> = ({ palette }) => {
  const [gradientColors, setGradientColors] = useState<{ id: string; color: string; stop: number; }[]>([])
  const [gradientConfig, setGradientConfig] = useState<GradientConfig>({
    type: 'linear',
    angle: 90,
    position: 'center',
  })
  const [gradientCSS, setGradientCSS] = useState('')

  const generateRandomGradient = useCallback(() => {
    if (palette.length < 2) return;
    const shuffled = [...palette].sort(() => 0.5 - Math.random());
    const numColors = Math.min(palette.length, Math.floor(Math.random() * 3) + 3);
    const selected = shuffled.slice(0, numColors);
    selected.sort((a,b) => chroma(a).luminance() - chroma(b).luminance());
    const types: GradientConfig['type'][] = ['linear', 'radial', 'conic'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomAngle = Math.floor(Math.random() * 360);
    const positions = ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'];
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    setGradientConfig({ type: randomType, angle: randomAngle, position: randomPosition });
    const newGradientColors = selected.map((color, index) => ({
      id: `${color}-${Date.now()}-${index}`,
      color,
      stop: Math.round((index / (selected.length - 1)) * 100),
    }));
    setGradientColors(newGradientColors);
    toast.success('魔法已施展！新漸層已生成 ✨');
  }, [palette]);

  useEffect(() => {
    if (palette.length >= 2) {
      generateRandomGradient();
    } else {
      setGradientColors([]);
    }
  }, [palette]);
  
  useEffect(() => {
    if (gradientColors.length < 2) {
      setGradientCSS(''); return;
    }
    const sortedColors = [...gradientColors].sort((a, b) => a.stop - b.stop);
    const colorStops = sortedColors.map(c => `${c.color} ${c.stop}%`).join(', ');
    let css = '';
    switch (gradientConfig.type) {
      case 'linear': css = `linear-gradient(${gradientConfig.angle}deg, ${colorStops})`; break;
      case 'radial': css = `radial-gradient(circle at ${gradientConfig.position}, ${colorStops})`; break;
      case 'conic': css = `conic-gradient(from ${gradientConfig.angle}deg at ${gradientConfig.position}, ${colorStops})`; break;
    }
    setGradientCSS(css);
  }, [gradientColors, gradientConfig]);

  const handleDownloadImage = useCallback(() => {
      const node = document.createElement('div');
      if (!gradientCSS) {
          toast.error('沒有可導出的漸層'); return;
      }
      toast.loading('正在生成高清圖片...', { id: 'download-gradient' });
      node.style.width = '1920px';
      node.style.height = '1080px';
      node.style.background = gradientCSS;
      node.style.position = 'absolute';
      node.style.top = '0';
      node.style.left = '-9999px';
      document.body.appendChild(node);
      toPng(node, { cacheBust: true, pixelRatio: 1 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `gradient-${gradientConfig.type}.png`;
          link.href = dataUrl;
          link.click();
          toast.success('1080p 漸層圖片下載成功！', { id: 'download-gradient' });
        })
        .catch((err) => {
          toast.error('圖片生成失敗', { id: 'download-gradient' });
          console.error('oops, something went wrong!', err);
        })
        .finally(() => {
          document.body.removeChild(node);
        });
  }, [gradientCSS, gradientConfig.type]);
  
  // 省略其他不變的函數以保持簡潔
  // ...

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 bg-gray-900/50 p-6 rounded-xl border border-white/20">
      {/* 這裡放回之前版本的所有 UI 元素，此處省略以保持簡潔 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Layers className="w-5 h-5 mr-3 text-cyan-400" />
          魔法漸層產生器
        </h3>
        <button onClick={generateRandomGradient} className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors" aria-label="隨機生成漸層">
          <Wand2 className="w-5 h-5" />
        </button>
      </div>
      <div className="w-full h-48 rounded-lg mb-4 border border-white/10" style={{ background: gradientCSS }} />
      {/* ... 其他UI ... */}
      <button onClick={handleDownloadImage} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
        <Download className="w-5 h-5 mr-2" />
        導出為 1080p 高清圖片
      </button>
    </motion.div>
  )
}

export default GradientGenerator;