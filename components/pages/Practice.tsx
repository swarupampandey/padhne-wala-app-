'use client'

import { useState } from 'react'
import { Volume2, Flag, ChevronRight, Clock, CheckCircle2, XCircle, Trophy } from 'lucide-react'

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
    explanation: 'Carbon has 6 protons in its nucleus. Atomic number is the number of protons.',
  },
  {
    id: 2,
    question: 'Photosynthesis occurs primarily in which organelle?',
    subject: 'Biology',
    options: ['A) Mitochondria', 'B) Nucleus', 'C) Chloroplast', 'D) Ribosome'],
    correct: 2,
    explanation: 'Photosynthesis takes place in the chloroplast, which contains chlorophyll pigments.',
  },
  {
    id: 3,
    question: 'What is the SI unit of force?',
    subject: 'Physics',
    options: ['A) Joule', 'B) Newton', 'C) Watt', 'D) Pascal'],
    correct: 1,
    explanation: 'Newton is the SI unit of force, named after Sir Isaac Newton.',
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
    const percentage = Math.round((score / mockQuestions.length) * 100)
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="card-glow p-12 text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center animate-bounce">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold gradient-text">Amazing!</h2>
          <div className="space-y-2">
            <p className="text-6xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{score}/{mockQuestions.length}</p>
            <p className="text-slate-400 text-lg">Accuracy: {percentage}%</p>
          </div>
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-slate-700/50 p-4 rounded-xl">
              <p className="text-2xl font-bold text-green-400">{score}</p>
              <p className="text-xs text-slate-400 mt-1">Correct</p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-xl">
              <p className="text-2xl font-bold text-orange-400">{mockQuestions.length - score}</p>
              <p className="text-xs text-slate-400 mt-1">Incorrect</p>
            </div>
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
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Practice Questions</h2>
          <span className="badge-primary">Question {currentQuestion + 1}/{mockQuestions.length}</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 via-pink-600 to-red-600 transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card-glow p-8 space-y-6">
        {/* Subject & Timing */}
        <div className="flex items-center justify-between">
          <span className="badge-primary uppercase text-xs">{question.subject}</span>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Time: 2:45</span>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-4">
          <p className="text-xl font-semibold text-white leading-relaxed">
            {question.question}
          </p>
          <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
            <Volume2 className="w-5 h-5 text-slate-400 hover:text-blue-400" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 py-4">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={showResult}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left font-medium text-lg ${
                selectedAnswer === idx
                  ? isCorrect
                    ? 'border-green-500 bg-green-500/10 text-green-300 shadow-lg shadow-green-500/30'
                    : 'border-red-500 bg-red-500/10 text-red-300 shadow-lg shadow-red-500/30'
                  : showResult && idx === question.correct
                  ? 'border-green-500 bg-green-500/10 text-green-300 shadow-lg shadow-green-500/30'
                  : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedAnswer === idx && (
                  isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                  )
                )}
                {showResult && idx === question.correct && selectedAnswer !== idx && (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                )}
                {option}
              </div>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {showResult && (
          <div className={`p-4 rounded-xl border-2 space-y-2 ${
            isCorrect
              ? 'border-green-500/30 bg-green-500/10'
              : 'border-amber-500/30 bg-amber-500/10'
          }`}>
            <p className={`font-semibold flex items-center gap-2 ${isCorrect ? 'text-green-400' : 'text-amber-400'}`}>
              {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
            <p className="text-slate-300 text-sm">{question.explanation}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-between items-center">
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-all">
          <Flag className="w-5 h-5" />
          Mark for Review
        </button>
        <button 
          onClick={handleNext}
          disabled={!showResult}
          className={`btn-primary disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {currentQuestion < mockQuestions.length - 1 ? 'Next' : 'Finish'} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
