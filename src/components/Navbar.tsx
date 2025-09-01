import React, { useState, useRef, useEffect } from 'react'
import { Menu, X, Zap, ChevronDown } from 'lucide-react'
import Modal from './Modal'
import { articles, Article } from '../content/articles' // 從新檔案導入文章數據

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const openArticleModal = (article: Article) => {
    setActiveArticle(article);
  };

  const closeArticleModal = () => {
    setActiveArticle(null);
  };

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
              <span>專業級配色</span>
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
                    {articles.map(article => (
                      <button key={article.id} onClick={() => { openArticleModal(article); setDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                        <article.icon className="w-4 h-4" />
                        {article.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4 space-y-2">
              <div className="text-center text-green-400 font-semibold mb-2">
                🎉 完全免費使用
              </div>
              {articles.map(article => (
                <button key={article.id} onClick={() => { openArticleModal(article); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-3 px-4 py-3 text-lg text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                  <article.icon className="w-5 h-5" />
                  {article.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* A single, dynamic Modal for all articles */}
      <Modal 
        isOpen={activeArticle !== null} 
        onClose={closeArticleModal} 
        title={activeArticle?.title || ''}
      >
        {activeArticle?.content}
      </Modal>
    </>
  )
}