import { BookOpen, BarChart3, Settings, Menu, LogOut, PlusCircle, Brain } from 'lucide-react'
import type { Page } from '../App'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  open: boolean
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Brain },
  { id: 'practice', label: 'Practice', icon: PlusCircle },
  { id: 'questions', label: 'Questions', icon: BookOpen },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
]

export default function Sidebar({ currentPage, onNavigate, open }: SidebarProps) {
  return (
    <aside className={`${
      open ? 'w-64' : 'w-20'
    } bg-card border-r border-border transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          {open && <span className="font-bold text-foreground">Zenith</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {open && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-muted-foreground hover:bg-muted/50`}>
          <Settings className="w-5 h-5 flex-shrink-0" />
          {open && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-500 hover:bg-red-500/10`}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {open && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
