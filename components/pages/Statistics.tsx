'use client'

import { BarChart3, TrendingUp, Calendar } from 'lucide-react'

export default function Statistics() {
  const weeklyStats = [
    { day: 'Mon', questions: 12, accuracy: 85 },
    { day: 'Tue', questions: 15, accuracy: 88 },
    { day: 'Wed', questions: 10, accuracy: 82 },
    { day: 'Thu', questions: 18, accuracy: 90 },
    { day: 'Fri', questions: 20, accuracy: 92 },
    { day: 'Sat', questions: 25, accuracy: 88 },
    { day: 'Sun', questions: 8, accuracy: 75 },
  ]

  const subjectStats = [
    { subject: 'Biology', accuracy: 85, questions: 156 },
    { subject: 'Chemistry', accuracy: 78, questions: 142 },
    { subject: 'Physics', accuracy: 88, questions: 168 },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Statistics</h1>
        <p className="text-slate-400 mt-2">Analyze your learning progress</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-50 font-semibold">Total Questions</h3>
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-slate-50">466</p>
          <p className="text-sm text-slate-400">+25 this week</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-50 font-semibold">Average Accuracy</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-slate-50">83.7%</p>
          <p className="text-sm text-slate-400">+2.1% improvement</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-50 font-semibold">Study Streak</h3>
            <Calendar className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-slate-50">12 days</p>
          <p className="text-sm text-slate-400">Keep it up!</p>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-50 mb-4">Weekly Activity</h2>
        <div className="space-y-4">
          {weeklyStats.map((stat) => (
            <div key={stat.day} className="space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>{stat.day}</span>
                <span>{stat.questions} questions</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${(stat.questions / 25) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">{stat.accuracy}% accuracy</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {subjectStats.map((subject) => (
          <div key={subject.subject} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-50">{subject.subject}</h3>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Accuracy</span>
                <span className="text-slate-50 font-semibold">{subject.accuracy}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                  style={{ width: `${subject.accuracy}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-slate-400">{subject.questions} questions practiced</p>
          </div>
        ))}
      </div>
    </div>
  )
}
