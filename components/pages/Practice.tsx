'use client'

import { useState } from 'react'
import { Volume2, Flag, ChevronRight, Clock } from 'lucide-react'

interface Question {
  id: number
  question: string
  subject: string
  options: string[]
  correct: number
  explanation: string
}

const mockQuestions: Question[] = [
  {
    id: 1,
    question: 'What is the atomic number of Carbon?',
    subject: 'Chemistry',
    options: ['A) 4', 'B) 6', 'C) 8', 'D) 12'],
    correct: 1,
    explanation: 'Carbon has 6 protons in its nucleus, making its atomic number 6.',
  },
  {
    id: 2,
    question: 'Photosynthesis occurs primarily in which organelle?',
    subject: 'Biology',
    options: ['A) Mitochondria', 'B) Nucleus', 'C) Chloroplast', 'D) Ribosome'],
    correct: 2,
    explanation: 'Photosynthesis takes place in the chloroplast, which contains chlorophyll.',
  },
]

export default function Practice() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = mockQuestions[currentQuestion]
  const isCorrect = selectedAnswer === question.correct

  const handleAnswer = (idx: number) => {
    if (!showResult) {
      setSelectedAnswer(idx)
      setShowResult(true)
      if (idx === question.correct) {
        setScore(score + 1)
      }
    }
  }

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setFinished(true)
    }
  }

  if (finished) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center space-y-6 max-w-md">
          <h2 className="text-3xl font-bold text-slate-50">Session Complete!</h2>
          <div className="space-y-2">
            <p className="text-5xl font-bold text-indigo-400">{score}/{mockQuestions.length}</p>
            <p className="text-slate-400">Accuracy: {Math.round((score / mockQuestions.length) * 100)}%</p>
          </div>
          <button
            onClick={() => {
              setCurrentQuestion(0)
              setSelectedAnswer(null)
              setShowResult(false)
              setScore(0)
              setFinished(false)
            }}
            className="btn-primary w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-50">Practice Questions</h2>
            <p className="text-slate-400 mt-1">Question {currentQuestion + 1} of {mockQuestions.length}</p>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-5 h-5" />
            <span>{Math.ceil((mockQuestions.length - currentQuestion - 1) * 2)} min left</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 space-y-6">
          {/* Subject Badge */}
          <div className="inline-block">
            <span className="px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400 text-sm font-medium">
              {question.subject}
            </span>
          </div>

          {/* Question */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <p className="text-2xl font-semibold text-slate-50 flex-1">
                {question.question}
              </p>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0">
                <Volume2 className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${
                  selectedAnswer === idx
                    ? isCorrect
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-red-500 bg-red-500/10 text-red-400'
                    : showResult && idx === question.correct
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 text-slate-300'
                }`}
                disabled={showResult}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Explanation */}
          {showResult && (
            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
              <p className="font-semibold mb-2">{isCorrect ? '✓ Correct!' : 'Explanation:'}</p>
              <p className="text-sm">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {showResult && (
          <div className="flex gap-4">
            <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
              <Flag className="w-4 h-4" />
              Mark for Review
            </button>
            <button
              onClick={handleNext}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {currentQuestion === mockQuestions.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
