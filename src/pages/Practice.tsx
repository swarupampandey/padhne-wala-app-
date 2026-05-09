import { useState } from 'react'
import { ChevronRight, Volume2, Flag } from 'lucide-react'

const mockQuestions = [
  {
    id: 1,
    question: 'What is the atomic number of Carbon?',
    subject: 'Chemistry',
    options: ['A) 4', 'B) 6', 'C) 8', 'D) 12'],
    correct: 1,
  },
  {
    id: 2,
    question: 'What is the capital of India?',
    subject: 'General Knowledge',
    options: ['A) Mumbai', 'B) Delhi', 'C) Bangalore', 'D) Chennai'],
    correct: 1,
  },
]

export default function Practice() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const question = mockQuestions[currentQuestion]
  const isCorrect = selectedAnswer === question.correct

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Practice Questions</h2>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {mockQuestions.length}
          </span>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-600 to-primary-400 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%` }}
          ></div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <div className="inline-block">
            <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium">
              {question.subject}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <p className="text-xl font-semibold text-foreground flex-1">
                {question.question}
              </p>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedAnswer(idx)
                  setShowResult(true)
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${
                  selectedAnswer === idx
                    ? isCorrect
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-red-500 bg-red-500/10'
                    : showResult && idx === question.correct
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border hover:border-primary-600/50 hover:bg-muted/50'
                }`}
                disabled={showResult}
              >
                {option}
              </button>
            ))}
          </div>

          {showResult && (
            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              <p className="font-semibold">
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p className="text-sm mt-2">The correct answer is {question.options[question.correct]}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button className="flex-1 btn-secondary">
            <Flag className="w-4 h-4" />
            Mark for Review
          </button>
          <button 
            onClick={handleNext}
            disabled={!showResult || currentQuestion === mockQuestions.length - 1}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
