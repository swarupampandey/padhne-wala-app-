'use client'

import { BookOpen, Brain, BarChart3, Settings, Zap, Home } from 'lucide-react'

type Page = 'dashboard' | 'practice' | 'questions' | 'statistics' | 'settings'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  open: boolean
}

export default function Sidebar({ currentPage, onNavigate, open }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'practice', label: 'Practice', icon: Brain },
    { id: 'questions', label: 'Questions', icon: BookOpen },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className={`${open ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300`}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {open && <span className="font-bold text-white">Zenith</span>}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {open && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-center text-xs text-slate-500">
        {open && 'v1.0'}
      </div>
    </div>
  )
}
