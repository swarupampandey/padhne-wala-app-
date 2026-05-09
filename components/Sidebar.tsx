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
    <div className={`${open ? 'w-72' : 'w-24'} bg-gradient-to-b from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col transition-all duration-300`}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50 flex items-center justify-center">
        <div className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:shadow-pink-500/50 transition-all group-hover:scale-110 group-hover:rotate-6">
            <Zap className="w-6 h-6 text-white animate-pulse" />
          </div>
          {open && <div className="space-y-1"><span className="font-black text-lg bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">Zenith</span><p className="text-xs text-slate-500">NEET AI</p></div>}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, idx) => {
          const Icon = item.icon
          const colors = ['from-blue-600', 'from-violet-600', 'from-pink-600', 'from-green-600', 'from-orange-600']
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                currentPage === item.id
                  ? `bg-gradient-to-r ${colors[idx]} to-transparent text-white shadow-lg shadow-violet-500/50`
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${currentPage === item.id ? 'animate-glow' : 'group-hover:scale-110 transition-transform'}`} />
              {open && <span className="text-sm font-semibold">{item.label}</span>}
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
