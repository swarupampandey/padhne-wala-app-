import { Bell, Lock, Palette, Database, LogOut } from 'lucide-react'

export default function Settings() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-muted-foreground mt-2">Manage your preferences</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span>Daily reminders</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span>Achievement notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span>Email updates</span>
            </label>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold">Appearance</h3>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Theme</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium">Dark</button>
              <button className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80">Light</button>
              <button className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80">Auto</button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold">Privacy & Security</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors">
              Change password
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors">
              Two-factor authentication
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors">
              Connected devices
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold">Data & Storage</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">Storage used</span>
              <span className="font-semibold">2.4 GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm">
              Clear cache
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm">
              Export data
            </button>
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-red-400">Danger Zone</h3>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400 font-medium">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
