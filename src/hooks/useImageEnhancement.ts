import { useState } from 'react'
import { supabase, EnhancementType, ImageEnhancement, UserProfile } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

export function useImageEnhancement() {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [history, setHistory] = useState<ImageEnhancement[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const uploadImage = async (
    file: File,
    enhancementType: EnhancementType,
    scaleFactor: number
  ) => {
    if (!user) {
      throw new Error('用戶未登錄')
    }

    setUploading(true)

    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Upload image via edge function
      const { data, error } = await supabase.functions.invoke('image-upload', {
        body: {
          imageData: base64Data,
          fileName: file.name,
          enhancementType,
          scaleFactor
        }
      })

      if (error) throw error

      if (data?.data) {
        toast.success('圖片上傳成功，開始處理...')
        return data.data
      } else {
        throw new Error('上傳響應格式錯誤')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || '圖片上傳失敗')
      throw error
    } finally {
      setUploading(false)
    }
  }

  const enhanceImage = async (processingId: string) => {
    setProcessing(true)

    try {
      const { data, error } = await supabase.functions.invoke('image-enhance', {
        body: { processingId }
      })

      if (error) throw error

      if (data?.data) {
        toast.success('圖片增強完成！')
        return data.data
      } else {
        throw new Error('處理響應格式錯誤')
      }
    } catch (error: any) {
      console.error('Enhancement error:', error)
      toast.error(error.message || '圖片增強失敗')
      throw error
    } finally {
      setProcessing(false)
    }
  }

  const fetchUserHistory = async (limit = 20, offset = 0) => {
    if (!user) return

    try {
      const { data, error } = await supabase.functions.invoke('get-user-history', {
        body: {},
        method: 'GET'
      })

      if (error) throw error

      if (data?.data) {
        setHistory(data.data.history)
        setUserProfile(data.data.userProfile)
        return data.data
      }
    } catch (error: any) {
      console.error('Fetch history error:', error)
      toast.error('獲取歷史記錄失敗')
    }
  }

  return {
    uploadImage,
    enhanceImage,
    fetchUserHistory,
    uploading,
    processing,
    history,
    userProfile
  }
}