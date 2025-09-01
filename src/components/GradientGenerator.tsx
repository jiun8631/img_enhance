// src/components/GradientGenerator.tsx

import React, { useState, useEffect } from 'react'
import { Copy, Layers } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

interface GradientGeneratorProps {
  palette: string[];
}

const GradientGenerator: React.FC<GradientGeneratorProps> = ({ palette }) => {
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear')
  const [angle, setAngle] = useState(90)
  const [gradientCSS, setGradientCSS] = useState('')

  useEffect(() => {
    if (palette.length < 2) {
      setGradientCSS('/* 請至少選擇兩種顏色來生成漸層 */');
      return;
    }

    let css = '';
    if (gradientType === 'linear') {
      css = `linear-gradient(${angle}deg, ${palette.join(', ')})`;
    } else {
      css = `radial-gradient(circle, ${palette.join(', ')})`;
    }
    setGradientCSS(css);
  }, [palette, gradientType, angle]);

  const copyCSS = () => {
    if (palette.length < 2) {
      toast.error('顏色不足，無法複製 CSS');
      return;
    }
    const fullCSS = `background: ${gradientCSS};`
    navigator.clipboard.writeText(fullCSS)
    toast.success('漸層 CSS 已複製！')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 bg-gray-900/50 p-6 rounded-xl border border-white/20"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Layers className="w-5 h-5 mr-3 text-cyan-400" />
        漸層產生器
      </h3>
      
      {/* 漸層預覽 */}
      <div 
        className="w-full h-32 rounded-lg mb-4 border border-white/10 transition-all"
        style={{ background: gradientCSS }}
      />
      
      {/* 控制項 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">類型</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setGradientType('linear')}
              className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${gradientType === 'linear' ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'}`}
            >
              線性
            </button>
            <button 
              onClick={() => setGradientType('radial')}
              className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${gradientType === 'radial' ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'}`}
            >
              徑向
            </button>
          </div>
        </div>
        
        {gradientType === 'linear' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <label htmlFor="angle" className="block text-sm font-medium text-white/80 mb-2">角度: {angle}°</label>
            <input 
              id="angle"
              type="range" 
              min="0" 
              max="360" 
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </motion.div>
        )}
      </div>

      {/* CSS 程式碼 */}
      <div className="relative bg-black/50 p-4 rounded-md font-mono text-sm text-cyan-300 border border-white/10">
        <code>
          <span className="text-purple-400">background</span>: {gradientCSS};
        </code>
        <button 
          onClick={copyCSS}
          className="absolute top-2 right-2 p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-md transition-colors"
          aria-label="複製 CSS"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default GradientGenerator;