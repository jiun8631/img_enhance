import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import HomePage from '@/components/HomePage'
import LoginPage from '@/components/LoginPage'
import HistoryPage from '@/components/HistoryPage'
import ProfilePage from '@/components/ProfilePage'
import AuthCallback from '@/components/AuthCallback'
import { useAuth } from '@/contexts/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
        }}
      />
      
      {/* Google AdSense placeholder areas */}
      <div className="fixed top-0 left-0 w-full h-16 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 z-40">
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          廣告區域 - 頂部橫幅 (728x90)
        </div>
      </div>
      
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-40 h-96 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg z-30">
        <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center px-2">
          廣告區域<br />側邊欄<br />(160x600)
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 w-full h-20 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 z-40">
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          廣告區域 - 底部橫幅 (728x90)
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App