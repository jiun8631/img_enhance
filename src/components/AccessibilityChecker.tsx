// src/components/AccessibilityChecker.tsx

import React from 'react'
import chroma from 'chroma-js'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface AccessibilityCheckerProps {
  palette: string[];
}

// 定義 WCAG 對比度標準
const WCAG_CONTRAST = {
  AA_NORMAL: 4.5, // AA 級，普通文字
  AA_LARGE: 3,    // AA 級，大號文字 (18pt / 24px)
  AAA_NORMAL: 7,  // AAA 級，普通文字
  AAA_LARGE: 4.5, // AAA 級，大號文字 (18pt / 24px)
};

// 根據對比度分數返回評級的組件
const RatingBadge = ({ ratio }: { ratio: number }) => {
  if (ratio >= WCAG_CONTRAST.AAA_NORMAL) {
    return <span className="flex items-center gap-1 font-bold text-green-400"><CheckCircle size={16} /> AAA</span>
  }
  if (ratio >= WCAG_CONTRAST.AA_NORMAL) {
    return <span className="flex items-center gap-1 font-bold text-teal-400"><CheckCircle size={16} /> AA</span>
  }
  if (ratio >= WCAG_CONTRAST.AA_LARGE) {
    return <span className="flex items-center gap-1 font-bold text-yellow-500"><AlertTriangle size={16} /> AA Large</span>
  }
  return <span className="flex items-center gap-1 font-bold text-red-500"><XCircle size={16} /> Fail</span>
}

export default function AccessibilityChecker({ palette }: AccessibilityCheckerProps) {
  if (!palette || palette.length < 2) {
    return null; // 顏色少於2種無法比較
  }

  // 創建所有可能的顏色組合
  const combinations: { fg: string, bg: string, ratio: number }[] = [];
  for (let i = 0; i < palette.length; i++) {
    for (let j = 0; j < palette.length; j++) {
      if (i === j) continue; // 不比較自己和自己
      const foreground = palette[i];
      const background = palette[j];
      const contrastRatio = chroma.contrast(foreground, background);
      combinations.push({ fg: foreground, bg: background, ratio: contrastRatio });
    }
  }

  // 為了不讓列表太長，我們只顯示對比度最高的 N 個組合
  const topCombinations = combinations
    .sort((a, b) => b.ratio - a.ratio) // 按對比度從高到低排序
    .slice(0, 10); // 只顯示前 10 個最佳組合

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white mb-4 text-center">無障礙對比度校驗 (WCAG)</h3>
      <div className="bg-white/5 rounded-lg p-4 space-y-3">
        <p className="text-sm text-white/60 mb-4">
          以下是從您調色盤中選出的最佳文字/背景顏色組合，確保您的設計對所有用戶都清晰可讀。
        </p>
        
        {topCombinations.map(({ fg, bg, ratio }, index) => (
          <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-md">
            {/* 顏色組合預覽 */}
            <div 
              className="w-2/5 h-12 rounded flex items-center justify-center font-bold text-lg" 
              style={{ backgroundColor: bg, color: fg }}
            >
              Aa
            </div>
            
            {/* 顏色代碼 */}
            <div className="w-1/5 text-center text-xs text-white/80">
              <div className="font-mono">{fg}</div>
              <div className="text-white/40">on</div>
              <div className="font-mono">{bg}</div>
            </div>

            {/* 對比度分數和評級 */}
            <div className="w-2/5 text-right">
              <div className="text-lg font-bold text-white">{ratio.toFixed(2)}</div>
              <RatingBadge ratio={ratio} />
            </div>
          </div>
        ))}

        <div className="pt-3 text-xs text-center text-white/50">
          * AA Large 表示該組合僅適用於大號文字 (≥ 24px)。
        </div>
      </div>
    </div>
  )
}