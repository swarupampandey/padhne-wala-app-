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
        <h1 className="text-4xl font-bold text-slate-50">Dashboard</h1>
        <p className="text-slate-400 mt-2">Welcome back! Track your NEET preparation progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          const colors = ['from-blue-600', 'from-purple-600', 'from-green-600', 'from-orange-600']
          return (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[idx]} to-transparent flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-50 mt-1">{stat.value}</h3>
                <p className="text-slate-500 text-xs mt-2">{stat.change}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-50">Recent Sessions</h2>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-50">{session.subject} - {session.topic}</p>
                    <p className="text-sm text-slate-400">{session.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">{session.score}/10</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-50">Upcoming</h2>
          <div className="space-y-3">
            {['Organic Chemistry', 'Genetics', 'Wave Motion'].map((topic) => (
              <div key={topic} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <div className="flex-1 text-sm text-slate-300">{topic}</div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
