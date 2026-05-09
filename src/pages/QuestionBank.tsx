import { useState } from 'react'
import { Search, Filter, Upload, BookMarked } from 'lucide-react'

const mockQuestions = [
  { id: 1, text: 'What is photosynthesis?', subject: 'Biology', difficulty: 'Easy', attempts: 5 },
  { id: 2, text: 'Calculate the molarity of NaCl solution', subject: 'Chemistry', difficulty: 'Medium', attempts: 3 },
  { id: 3, text: 'What is Newton\'s First Law?', subject: 'Physics', difficulty: 'Hard', attempts: 8 },
  { id: 4, text: 'Define evaporation', subject: 'Biology', difficulty: 'Easy', attempts: 2 },
]

export default function QuestionBank() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')

  const filteredQuestions = mockQuestions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || q.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  const subjects = ['All', 'Biology', 'Chemistry', 'Physics']
  const difficulties = { Easy: 'text-green-400', Medium: 'text-yellow-400', Hard: 'text-red-400' }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Question Bank</h2>
          <p className="text-muted-foreground mt-2">Manage and practice questions</p>
        </div>
        <button className="btn-primary">
          <Upload className="w-4 h-4" />
          Import Questions
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <button className="btn-secondary">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Subject Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {subjects.map(subject => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject.toLowerCase())}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedSubject === subject.toLowerCase()
                ? 'bg-primary-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(q => (
            <div key={q.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary-600/50 transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{q.text}</h3>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded">
                      {q.subject}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${difficulties[q.difficulty as keyof typeof difficulties]} bg-white/5`}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-muted-foreground">{q.attempts} attempts</p>
                  <button className="mt-2 p-2 hover:bg-muted rounded-lg transition-colors">
                    <BookMarked className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No questions found</p>
          </div>
        )}
      </div>
    </div>
  )
}
