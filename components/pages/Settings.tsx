'use client'

import { Bell, Palette, Lock, Database, LogOut, ChevronRight } from 'lucide-react'

export default function Settings() {
  const sections = [
    {
      icon: Bell,
      title: 'Notifications',
      items: [
        { label: 'Daily reminders', enabled: true },
        { label: 'Achievement notifications', enabled: true },
        { label: 'Email updates', enabled: false },
      ],
    },
    {
      icon: Palette,
      title: 'Appearance',
      items: [
        { label: 'Dark mode', enabled: true },
        { label: 'Compact layout', enabled: false },
      ],
    },
    {
      icon: Lock,
      title: 'Security',
      items: [
        { label: 'Two-factor authentication' },
        { label: 'Change password' },
        { label: 'Connected devices' },
      ],
    },
  ]

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your preferences and account</p>
      </div>

      {/* Settings Sections */}
      {sections.map((section) => {
        const Icon = section.icon
        return (
          <div key={section.title} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Icon className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-50">{section.title}</h2>
            </div>
            <div className="space-y-3">
              {'enabled' in section.items[0] ? (
                section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <span className="text-slate-300 text-sm">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={item.enabled}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </div>
                ))
              ) : (
                section.items.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors group"
                  >
                    <span className="text-slate-300 text-sm group-hover:text-slate-50">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        )
      })}

      {/* Storage */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-50">Storage</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Storage used</span>
            <span className="text-slate-50 font-semibold">2.4 GB / 15 GB</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '16%' }}></div>
          </div>
          <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Clear cache</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400 font-medium">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
