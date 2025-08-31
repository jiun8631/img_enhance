// src/components/GradientGenerator.tsx

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Copy, RefreshCw, Palette } from 'lucide-react';
import chroma from 'chroma-js';

interface GradientGeneratorProps {
  palette: string[];
}

// 漸層方向的選項
const GRADIENT_DIRECTIONS = [
  { label: '→', value: 'to right' },
  { label: '↘', value: 'to bottom right' },
  { label: '↓', value: 'to bottom' },
  { label: '↙', value: 'to bottom left' },
  { label: '←', value: 'to left' },
  { label: '↖', value: 'to top left' },
  { label: '↑', value: 'to top' },
  { label: '↗', value: 'to top right' },
];

export default function GradientGenerator({ palette }: GradientGeneratorProps) {
  // 狀態：儲存使用者選擇用於漸層的顏色
  // 預設選取調色盤中最亮的和最暗的兩個顏色
  const [gradientColors, setGradientColors] = useState<string[]>([palette[0], palette[palette.length - 1]]);
  // 狀態：儲存漸層的方向
  const [direction, setDirection] = useState(GRADIENT_DIRECTIONS[0].value);

  // 當主調色盤 palette 更新時，自動重設漸層顏色
  React.useEffect(() => {
    if (palette.length >= 2) {
      setGradientColors([palette[0], palette[palette.length - 1]]);
    }
  }, [palette]);
  
  // 處理使用者點選顏色塊的邏輯
  const handleColorClick = (color: string) => {
    setGradientColors(prev => {
      // 如果顏色已存在，則移除
      if (prev.includes(color)) {
        // 至少保留一種顏色
        return prev.length > 1 ? prev.filter(c => c !== color) : prev;
      }
      // 如果顏色不存在，則添加
      return [...prev, color];
    });
  };

  // 生成 CSS 漸層代碼 (使用 useMemo 進行性能優化)
  const cssGradient = useMemo(() => {
    if (gradientColors.length < 2) return `linear-gradient(${direction}, ${gradientColors[0]}, ${gradientColors[0]})`;
    return `linear-gradient(${direction}, ${gradientColors.join(', ')})`;
  }, [gradientColors, direction]);
  
  const copyCSS = () => {
    navigator.clipboard.writeText(`background: ${cssGradient};`);
    toast.success('CSS 漸層代碼已複製！');
  };

  // 隨機選取2-4種顏色來生成漸層
  const randomizeGradient = () => {
    const shuffled = [...palette].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 3) + 2; // 隨機選 2, 3, 4 種
    setGradientColors(shuffled.slice(0, count));
  };

  if (!palette || palette.length < 2) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white mb-4 text-center">漸層產生器</h3>
      <div className="bg-white/5 rounded-lg p-4 space-y-4">

        {/* 漸層預覽區 */}
        <div 
          className="h-48 w-full rounded-lg flex items-center justify-center shadow-inner"
          style={{ background: cssGradient }}
        >
          <div className="bg-black/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            點擊下方色塊組合漸層
          </div>
        </div>
        
        {/* 可選顏色列表 */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {palette.map((color, index) => (
            <button
              key={index}
              style={{ backgroundColor: color }}
              className={`h-12 rounded-md transition-all duration-200 transform hover:scale-110 ${
                gradientColors.includes(color) ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => handleColorClick(color)}
            />
          ))}
        </div>

        {/* 控制選項和操作按鈕 */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
            <span className="text-sm text-white/70 pl-2">方向:</span>
            {GRADIENT_DIRECTIONS.map(dir => (
              <button
                key={dir.value}
                onClick={() => setDirection(dir.value)}
                className={`w-8 h-8 rounded-md transition-colors ${
                  direction === dir.value ? 'bg-blue-600 text-white' : 'bg-transparent text-white/50 hover:bg-white/20'
                }`}
              >
                {dir.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={randomizeGradient} className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center gap-2 text-sm">
              <RefreshCw size={16} /> 隨機
            </button>
            <button onClick={copyCSS} className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 text-sm">
              <Copy size={16} /> 複製CSS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}