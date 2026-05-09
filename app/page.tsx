'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Dashboard from '@/components/pages/Dashboard'
import Practice from '@/components/pages/Practice'
import QuestionBank from '@/components/pages/QuestionBank'
import Statistics from '@/components/pages/Statistics'
import Settings from '@/components/pages/Settings'

type Page = 'dashboard' | 'practice' | 'questions' | 'statistics' | 'settings'

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        open={sidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
