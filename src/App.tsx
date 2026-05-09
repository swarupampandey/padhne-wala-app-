import { useState, useEffect } from 'react'
import Sidebar from '@components/Sidebar'
import Header from '@components/Header'
import Dashboard from '@pages/Dashboard'
import Practice from '@pages/Practice'
import QuestionBank from '@pages/QuestionBank'
import Statistics from '@pages/Statistics'
import Settings from '@pages/Settings'

export type Page = 'dashboard' | 'practice' | 'questions' | 'statistics' | 'settings'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    // Initialize user session
    const userId = localStorage.getItem('userId')
    if (!userId) {
      localStorage.setItem('userId', `user_${Date.now()}`)
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'practice':
        return <Practice />
      case 'questions':
        return <QuestionBank />
      case 'statistics':
        return <Statistics />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        open={sidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
