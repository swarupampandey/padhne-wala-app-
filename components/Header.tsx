'use client'

import { Menu, Search, Bell, User } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-gradient-to-r from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:scale-110"
        >
          <Menu className="w-5 h-5 text-slate-300" />
        </button>

        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-violet-400 transition-colors" />
            <input
              type="text"
              placeholder="Search topics, chapters..."
              className="input-primary w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2.5 hover:bg-slate-700/50 rounded-xl transition-all duration-200 hover:scale-110 relative group">
          <Bell className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
        </button>
        <button className="p-2.5 hover:bg-slate-700/50 rounded-xl transition-all duration-200 hover:scale-110 group">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white group-hover:shadow-lg group-hover:shadow-pink-500/50">A</div>
        </button>
      </div>
    </header>
  )
}
