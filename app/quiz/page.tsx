"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

// Metaphorical Questions
const questions = [
  {
    id: "atmosphere",
    question: "If today were a room, what would the light look like?",
    options: [
      { value: "melancholic", label: "Twilit & Quiet", desc: "Heavy curtains drawn. Private." },
      { value: "energetic", label: "Bright & Fierce", desc: "Sunlight forcing its way in." },
      { value: "peaceful", label: "Hazy & Soft", desc: "Morning mist on cold glass." },
      { value: "mysterious", label: "Flickering Shadow", desc: "A single lamp at midnight." },
    ],
  },
  {
    id: "pace",
    question: "How do you want time to pass?",
    options: [
      { value: "slow", label: "Like drifting smoke", desc: "Linger on every sentence." },
      { value: "medium", label: "Like a long walk", desc: "Steady, rhythmic, forward." },
      { value: "fast", label: "Like a racing heart", desc: "Can't turn the pages fast enough." },
    ],
  },
  {
    id: "connection",
    question: "Who do you want to meet there?",
    options: [
      { value: "friends", label: "Old Friends", desc: "Warm connection and comfort." },
      { value: "strangers", label: "Dark Strangers", desc: "Secrets and caution." },
      { value: "sages", label: "Wise Voices", desc: "To learn and reflect." },
    ],
  },
  {
    id: "aftertaste",
    question: "When you close the book, what stays?",
    options: [
      { value: "hope", label: "A Quiet Hope", desc: "Light in the dark." },
      { value: "questions", label: "A Beautiful Question", desc: "Something to carry with you." },
      { value: "catharsis", label: "A Clean Slate", desc: "Tears, then peace." },
    ],
  },
]

export default function QuizPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const handleAnswer = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
    // Auto advance slow
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 500)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  // Check if all questions have an answer (basic check for the last step)
  const isComplete = questions.every((q) => answers[q.id]);
  const q = questions[currentQuestion]

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-1000 p-6">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />
      <div className="living-gradient" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-50">
        <Link href="/">
          <span className="font-serif italic text-muted-foreground hover:text-foreground transition-colors opacity-70">Return</span>
        </Link>
        <ThemeToggle />
      </nav>

      {/* Question Area */}
      <div className="w-full max-w-4xl relative z-10 min-h-[60vh] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(5px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <div className="space-y-4 text-center">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/40 block">
                {currentQuestion + 1} / {questions.length}
              </span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif leading-tight text-balance-header opacity-90">
                {q.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-8 w-full max-w-3xl mx-auto">
              {q.options.map((option, i) => {
                const isSelected = answers[q.id] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2, duration: 0.8 }}
                    onClick={() => handleAnswer(q.id, option.value)}
                    className={`
                      group relative text-left p-6 md:p-8 rounded-xl
                      transition-all duration-700 ease-out border
                      ${isSelected
                        ? 'bg-foreground/5 border-foreground/20 opacity-100 scale-[1.02]'
                        : 'bg-transparent border-transparent hover:bg-foreground/5 hover:border-foreground/10 opacity-60 hover:opacity-100'}
                    `}
                  >
                    <div className="flex flex-col gap-2">
                      <span className={`font-serif text-xl md:text-2xl ${isSelected ? 'italic' : ''} transition-all duration-300`}>
                        {option.label}
                      </span>
                      <span className="text-sm font-light text-muted-foreground group-hover:text-foreground/80 transition-colors duration-500">
                        {option.desc}
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Action for Completion */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
            className="fixed bottom-12 z-20"
          >
            <Link href={`/results?answers=${encodeURIComponent(JSON.stringify(answers))}`}>
              <Button size="lg" className="rounded-full px-12 py-8 text-xl font-serif bg-foreground text-background hover:bg-foreground/90 transition-all duration-700 shadow-2xl hover:scale-105">
                Reveal Your Reflection
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      {currentQuestion > 0 && !isComplete && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          whileHover={{ opacity: 1 }}
          onClick={handleBack}
          className="fixed bottom-8 left-8 text-muted-foreground hover:text-foreground transition-all p-4"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  )
}
