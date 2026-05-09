'use client'

import { Search, Filter } from 'lucide-react'

const questions = [
  { id: 1, question: 'What is the atomic number of Carbon?', subject: 'Chemistry', difficulty: 'Easy' },
  { id: 2, question: 'Define photosynthesis', subject: 'Biology', difficulty: 'Medium' },
  { id: 3, question: 'State Newtons first law of motion', subject: 'Physics', difficulty: 'Easy' },
  { id: 4, question: 'Explain enzyme catalysis', subject: 'Biology', difficulty: 'Hard' },
  { id: 5, question: 'What is electronegativity?', subject: 'Chemistry', difficulty: 'Medium' },
  { id: 6, question: 'Derive equations of motion', subject: 'Physics', difficulty: 'Hard' },
]

export default function QuestionBank() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Question Bank</h1>
        <p className="text-slate-400 mt-2">Browse and practice NEET questions</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            className="input-field pl-10"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Questions List */}
      <div className="grid gap-4">
        {questions.map((q) => (
          <div key={q.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-slate-50 font-medium">{q.question}</p>
                <div className="flex gap-3 mt-3">
                  <span className="px-2 py-1 bg-indigo-600/20 text-indigo-400 text-xs rounded-full">{q.subject}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    q.difficulty === 'Easy' ? 'bg-green-600/20 text-green-400' :
                    q.difficulty === 'Medium' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
              </div>
              <button className="btn-primary text-sm py-1 px-3">Practice</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
