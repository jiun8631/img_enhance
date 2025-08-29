import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export default function AuthCallback() {
  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const hashFragment = window.location.hash
        
        if (hashFragment && hashFragment.length > 0) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(hashFragment)
          
          if (error) {
            console.error('Auth callback error:', error)
            toast.error('認證失敗：' + error.message)
            window.location.href = '/login?error=' + encodeURIComponent(error.message)
            return
          }
          
          if (data.session) {
            toast.success('認證成功！歡迎加入！')
            window.location.href = '/'
            return
          }
        }
        
        // If we get here, something went wrong
        window.location.href = '/login?error=No session found'
      } catch (error: any) {
        console.error('Auth callback error:', error)
        toast.error('認證出現問題')
        window.location.href = '/login'
      }
    }
    
    handleAuthCallback()
  }, [])

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">正在處理認證...</h2>
        <p className="text-white/60">請稍候，我們正在驗證您的身份</p>
      </div>
    </div>
  )
}