// src/components/TemplatePreview.tsx

import React from 'react'
import chroma from 'chroma-js'

interface TemplatePreviewProps {
  palette: string[];
}

// 輔助函數：智能地從調色盤中選取顏色
// 即使調色盤顏色數量不足，也能安全地回退，避免錯誤
const getColor = (palette: string[], index: number, fallback: string = '#cccccc') => {
  return palette[index] || palette[palette.length - 1] || fallback;
};

// 輔助函數：根據背景色，智能地選擇對比度足夠的文字顏色
const getTextColor = (backgroundColor: string, palette: string[]) => {
    // 從調色盤中尋找與背景對比度最高的顏色
    let bestColor = palette[0] || '#000000';
    let maxContrast = 0;
    
    for (const color of palette) {
        const contrast = chroma.contrast(backgroundColor, color);
        if (contrast > maxContrast) {
            maxContrast = contrast;
            bestColor = color;
        }
    }

    // 如果最高對比度仍然太低（小於 3），則退回到純黑或純白
    if (maxContrast < 3) {
        return chroma.contrast(backgroundColor, 'white') > chroma.contrast(backgroundColor, 'black') ? 'white' : 'black';
    }

    return bestColor;
}


export default function TemplatePreview({ palette }: TemplatePreviewProps) {
  if (!palette || palette.length < 4) {
    // 如果顏色少於 4 種，很難構成一個有意義的預覽，可以顯示提示信息
    return (
      <div className="mt-6 p-4 bg-white/5 rounded-lg text-center text-white/60">
        需要至少 4 種顏色才能生成預覽。
      </div>
    );
  }

  // 智能分配顏色角色
  // 我們假設調色盤已按亮度排序 (亮 -> 暗 或 暗 -> 亮)
  const bgColor = getColor(palette, 0); // 最亮/最暗的作為背景
  const cardColor = getColor(palette, 1);
  const primaryTextColor = getTextColor(cardColor, palette);
  const secondaryTextColor = chroma(primaryTextColor).alpha(0.7).hex(); // 創建一個半透明的版本
  const accentColor = getColor(palette, palette.length - 1); // 用對比最強的顏色作為強調色
  const buttonTextColor = getTextColor(accentColor, [getColor(palette,0), getColor(palette,1)]);


  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white mb-4 text-center">UI 樣板即時預覽</h3>
      <div 
        className="p-8 rounded-2xl transition-colors duration-500"
        style={{ backgroundColor: bgColor }}
      >
        <div 
          className="max-w-md mx-auto rounded-xl shadow-2xl overflow-hidden transition-colors duration-500"
          style={{ backgroundColor: cardColor }}
        >
          {/* 卡片頂部圖片區塊 */}
          <div 
            className="h-32 w-full"
            style={{ 
              background: `linear-gradient(45deg, ${getColor(palette, 2)}, ${getColor(palette, 3)})`
            }}
          />
          
          {/* 卡片內容 */}
          <div className="p-6">
            <div 
              className="uppercase tracking-wide text-sm font-semibold transition-colors duration-500"
              style={{ color: accentColor }}
            >
              主題卡片
            </div>
            <h2 
              className="block mt-1 text-2xl leading-tight font-bold transition-colors duration-500"
              style={{ color: primaryTextColor }}
            >
              探索色彩的和諧
            </h2>
            <p 
              className="mt-2 text-base transition-colors duration-500"
              style={{ color: secondaryTextColor }}
            >
              這是一個根據您生成的調色盤即時渲染的 UI 範例。它展示了背景、卡片、文字和按鈕之間的色彩搭配效果。
            </p>

            <div className="mt-6">
              <button
                className="px-6 py-3 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
                style={{
                  backgroundColor: accentColor,
                  color: buttonTextColor,
                }}
              >
                瞭解更多
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}