import React, { useState, useRef, useEffect } from 'react'
import { Menu, X, Zap, ChevronDown, BookOpen, BarChart2 } from 'lucide-react'
import Modal from './Modal' // 引入我們剛創建的 Modal 元件

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showHowToUseModal, setShowHowToUseModal] = useState(false)
  const [showSeoArticleModal, setShowSeoArticleModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 點擊外部區域關閉下拉選單的邏輯
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  const navLinks = [
    { 
      label: '如何使用', 
      icon: BookOpen, 
      action: () => setShowHowToUseModal(true) 
    },
    { 
      label: '色彩的力量', 
      icon: BarChart2, 
      action: () => setShowSeoArticleModal(true) 
    },
  ];

  return (
    <>
      <nav className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 font-bold text-xl text-white">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span>AI 顏色配色生成器</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-green-400 font-semibold">
                🎉 完全免費使用
              </div>
              <div ref={dropdownRef} className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-1 text-white/80 hover:text-white transition-colors">
                  <span>更多資訊</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-xl py-1">
                    {navLinks.map(link => (
                      <button key={link.label} onClick={() => { link.action(); setDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4 space-y-2">
              <div className="text-center text-green-400 font-semibold mb-2">
                🎉 完全免費使用
              </div>
              {navLinks.map(link => (
                <button key={link.label} onClick={() => { link.action(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-3 px-4 py-3 text-lg text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Modals for content */}
      <Modal isOpen={showHowToUseModal} onClose={() => setShowHowToUseModal(false)} title="🚀 如何使用本網站">
        <div>
          <p>歡迎使用 AI 顏色配色生成器！只需三步，即可獲得專業級的配色方案：</p>
          <ol>
            <li><strong>上傳圖片：</strong> 點擊或拖拽任何您喜歡的圖片到上傳區域。它可以是風景、插畫、UI 截圖或任何能給您帶來靈感的圖像。</li>
            <li><strong>選擇模式：</strong> 在圖片下方，您可以選擇不同的配色模式（如標準、互補、莫蘭迪等）和主題（如暖色、冷色、粉彩等），以及您想要的顏色數量。</li>
            <li><strong>生成與探索：</strong> 點擊「生成配色方案」按鈕。我們的 AI 演算法會立即分析圖片並提取出和諧、實用的色彩。您可以直接複製色碼，導出 PNG 色卡，或是在下方的「AI 魔法漸層產生器」中探索由這些顏色構成的驚豔背景！</li>
          </ol>
          <p>每一次點擊「重新生成」或「施展魔法」，都會有新的驚喜等著您。祝您創作愉快！</p>
        </div>
      </Modal>

      <Modal isOpen={showSeoArticleModal} onClose={() => setShowSeoArticleModal(false)} title="色彩的力量：提升品牌感知的秘密">
        <div>
          <h3>引言：為何顏色至關重要？</h3>
          <p>在數位世界中，第一印象往往在 90 秒內形成，而其中 62-90% 的判斷僅僅基於顏色。顏色不僅僅是美學選擇，它是一種強大的溝通工具，能夠直接影響用戶的情緒、行為和對品牌的感知。一個精準的配色方案，是成功網站和應用的基石。</p>
          
          <h3>色彩心理學入門</h3>
          <p>不同的顏色會引發不同的情感聯繫：</p>
          <ul>
            <li><strong>藍色：</strong> 常與信任、穩定、專業聯繫在一起，是許多科技和金融公司的首選。</li>
            <li><strong>紅色：</strong> 代表激情、緊急和能量。常用於促銷按鈕（如「立即購買」）或餐飲業以刺激食慾。</li>
            <li><strong>綠色：</strong> 象徵自然、成長與和諧。適合環保、健康和金融（代表財富增長）相關的品牌。</li>
            <li><strong>黃色：</strong> 充滿樂觀、年輕和活力，能有效吸引注意力。</li>
          </ul>

          <h3>如何利用本工具提升您的設計？</h3>
          <p>傳統的配色方法耗時且需要深厚的理論基礎。而「AI 顏色配色生成器」將這一過程變得簡單而高效。您可以上傳一張符合您品牌調性的圖片，我們的工具會利用先進的色彩量化演算法，提取出不僅美觀而且內部和諧的顏色。使用「無障礙對比度校驗」功能，確保您的設計對所有用戶都清晰可讀，這對於提升用戶體驗和 SEO 排名至關重要。</p>

          <h3>結論</h3>
          <p>善用色彩是提升設計水平和商業價值的捷徑。立即開始使用我們的免費工具，從您喜愛的圖片中發掘無窮的色彩靈感，為您的下一個專案注入專業的色彩靈魂！</p>
        </div>
      </Modal>
    </>
  )
}