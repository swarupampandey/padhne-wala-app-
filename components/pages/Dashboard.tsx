'use client'

import { BookOpen, Brain, TrendingUp, Flame, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { icon: BookOpen, label: 'Questions Solved', value: '156', change: '+12 today' },
    { icon: Brain, label: 'Topics Covered', value: '24', change: 'Biology, Chemistry' },
    { icon: TrendingUp, label: 'Accuracy', value: '78%', change: '+2% this week' },
    { icon: Flame, label: 'Current Streak', value: '12 days', change: 'Keep it up!' },
  ]

  const recentSessions = [
    { id: 1, subject: 'Biology', topic: 'Photosynthesis', score: 8, date: 'Today' },
    { id: 2, subject: 'Chemistry', topic: 'Periodic Table', score: 7, date: 'Yesterday' },
    { id: 3, subject: 'Physics', topic: 'Newton Laws', score: 9, date: '2 days ago' },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="section-title">Dashboard</h1>
        <p className="section-subtitle">Welcome back! Track your NEET preparation progress</p>
      </div>

      {/* Stats Grid with Beautiful Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          const gradients = [
            'from-blue-600 to-cyan-600',
            'from-violet-600 to-pink-600',
            'from-green-600 to-emerald-600',
            'from-amber-600 to-orange-600'
          ]
          return (
            <div key={idx} className="card-glow p-6 space-y-4 group">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradients[idx]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-4xl font-black text-white mt-2">{stat.value}</h3>
                <p className="text-slate-500 text-xs mt-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {stat.change}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card-glow p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">Recent Sessions</h2>
            <div className="space-y-3">
              {recentSessions.map((session, idx) => (
                <div key={session.id} className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-slate-600 transition-all hover-lift group">
                  <div className="flex-1">
                    <p className="font-semibold text-white group-hover:text-pink-300 transition-colors">{session.subject} - {session.topic}</p>
                    <p className="text-sm text-slate-500 mt-1">{session.date}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-black ${session.score >= 8 ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'} bg-clip-text text-transparent`}>
                      {session.score}/10
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-glow p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">Upcoming Topics</h2>
          <div className="space-y-2">
            {['Organic Chemistry', 'Genetics', 'Wave Motion'].map((topic, idx) => (
              <div key={topic} className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-violet-500/50 transition-all cursor-pointer group">
                <div className={`w-3 h-3 rounded-full ${['bg-violet-500', 'bg-pink-500', 'bg-blue-500'][idx]}`}></div>
                <div className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors">{topic}</div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
