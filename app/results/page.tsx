"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart, ArrowLeft, Share2, RefreshCw, Sparkles, BookOpen } from "lucide-react"
import { BookCover } from "@/components/ui/book-cover"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { matchMoodToGenre } from "@/lib/stories"

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savedBookIds, setSavedBookIds] = useState<Set<number>>(new Set())

  // New state for matched genre
  const [matchedStoryGenre, setMatchedStoryGenre] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      const answersStr = searchParams.get("answers")
      if (!answersStr) return;

      try {
        const answers = JSON.parse(decodeURIComponent(answersStr))

        const response = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        })

        const result = await response.json()
        setData(result)

        // Calculate recommended genre
        if (result.moodAnalysis) {
          const genre = matchMoodToGenre(result.moodAnalysis);
          setMatchedStoryGenre(genre);
        }

        setLoading(false)

        // Sync saved books
        const saved = localStorage.getItem("novelaura_saved_books")
        if (saved) {
          const savedBooks = JSON.parse(saved) as any[]
          const savedIds = new Set(savedBooks.map((book) => book.id))
          setSavedBookIds(savedIds as Set<number>)
        }

      } catch (error) {
        console.error("Failed to fetch recommendations:", error)
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [searchParams])

  const handleSaveBook = (book: any) => {
    const saved = localStorage.getItem("novelaura_saved_books") || "[]"
    const savedBooks = JSON.parse(saved) as any[]

    if (savedBookIds.has(book.id)) {
      const updated = savedBooks.filter((b) => b.id !== book.id)
      localStorage.setItem("novelaura_saved_books", JSON.stringify(updated))
      const newSavedIds = new Set(savedBookIds)
      newSavedIds.delete(book.id)
      setSavedBookIds(newSavedIds)
    } else {
      savedBooks.push(book)
      localStorage.setItem("novelaura_saved_books", JSON.stringify(savedBooks))
      setSavedBookIds(new Set([...savedBookIds, book.id]))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center space-y-6">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 rounded-full bg-foreground/5 blur-3xl absolute"
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="font-serif text-2xl md:text-3xl text-foreground/80 tracking-widest italic relative z-10"
        >
          Listening to your silence...
        </motion.div>
        <p className="text-muted-foreground text-sm font-light relative z-10">Weaving your atmosphere</p>
      </div>
    )
  }

  if (!data) return null;

  const { moodAnalysis, recommendations } = data;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />
      <div className="living-gradient" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-50">
        <Link href="/">
          <span className="font-serif italic text-muted-foreground hover:text-foreground transition-colors opacity-70">Home</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/my-library" className="text-sm font-medium hover:text-primary transition-colors">My Library</Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">

        {/* POETIC MOOD ANALYSIS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center mb-24 max-w-2xl mx-auto space-y-8"
        >
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground/60">Your Atmosphere</span>
            <h1 className="font-serif text-4xl md:text-6xl leading-tight text-balance-header opacity-90">
              {moodAnalysis.title}
            </h1>
          </div>

          <p className="text-lg md:text-xl font-light text-muted-foreground leading-relaxed italic">
            {moodAnalysis.description}
          </p>

          {/* INTENT PHRASE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="inline-block relative group cursor-default">
              <div className="absolute inset-0 bg-foreground/5 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative border border-foreground/10 bg-background/30 backdrop-blur-md px-8 py-4 rounded-full">
                <p className="font-serif text-foreground/90 italic">"{moodAnalysis.intent}"</p>
              </div>
            </div>

            {/* NEW: Link to Story Experience */}
            {matchedStoryGenre && (
              <Link href={`/stories?genre=${matchedStoryGenre}`}>
                <Button
                  size="lg"
                  className="rounded-full px-8 py-6 text-sm uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-500 shadow-[0_0_20px_-5px_var(--primary)]"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enter a {matchedStoryGenre} Story
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>

        {/* BOOKS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {recommendations.map((book: any, index: number) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.2, duration: 1.2, ease: "easeOut" }}
              className="group flex flex-col items-center text-center space-y-8"
            >
              {/* Cover with Glow */}
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ duration: 0.5 }}
                  className="relative shadow-2xl shadow-black/20 z-10"
                >
                  <BookCover book={book} className="w-[180px] h-[270px] md:w-[220px] md:h-[330px] object-cover rounded-sm brightness-90 group-hover:brightness-100 transition-all duration-700" />
                </motion.div>
                {/* Back Glow */}
                <div className="absolute inset-0 bg-white/20 dark:bg-white/10 blur-3xl -z-10 opacity-0 group-hover:opacity-50 transition-opacity duration-1000 scale-150" />
              </div>

              {/* AI REASONING CARD ("The Why") */}
              <div className="w-full max-w-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-medium">{book.title}</h3>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{book.author}</p>
                </div>

                {/* The AI's Whisper */}
                <div className="bg-foreground/5 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 p-2 opacity-10">
                    <Share2 size={40} />
                  </div>
                  <p className="font-serif text-sm italic text-foreground/80 leading-relaxed relative z-10">
                    {book.reasoning}
                  </p>
                </div>

                <p className="font-light text-muted-foreground/60 text-xs line-clamp-2">
                  {book.description}
                </p>

                {/* Action */}
                <Button
                  variant="ghost"
                  onClick={() => handleSaveBook(book)}
                  className={`rounded-full hover:bg-transparent hover:scale-110 transition-all duration-300 ${savedBookIds.has(book.id) ? "text-red-500" : "text-muted-foreground"}`}
                >
                  <Heart className={savedBookIds.has(book.id) ? "fill-current" : ""} size={20} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 2 }}
          className="text-center mt-32 flex justify-center gap-8"
        >
          <Link href="/quiz">
            <Button variant="outline" className="gap-2 rounded-full font-serif italic border-foreground/20 hover:bg-foreground/5">
              <RefreshCw size={14} /> Reflect Again
            </Button>
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
