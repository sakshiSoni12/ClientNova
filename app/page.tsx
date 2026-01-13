"use client"

import Link from "next/link"
<<<<<<< HEAD
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Shield, Zap, Users, Palette, Globe, Layers } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { AnimatedBackground } from "@/components/animated-background"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { InteractiveLogo } from "@/components/interactive-logo"

export default function LandingPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Check if user has an active session
    const checkSession = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
=======
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/theme-toggle"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { MoodMarquee } from "@/components/ui/mood-marquee"
import { FloatingBooks } from "@/components/ui/floating-books"

// Floating Shape Component
function FloatingShape({ className, delay }: { className: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        y: [0, -30, 0],
        rotate: [0, 10, -10, 0]
      }}
      transition={{
        duration: 10,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`absolute blur-3xl rounded-full opacity-60 mix-blend-multiply dark:mix-blend-screen ${className}`}
    />
  )
}

function HomeContent() {
  const [user, setUser] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  // Parallax Logic
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 150])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  // Process Fade Initials
  const processVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.3, duration: 1 } })
  }

  useEffect(() => {
    setIsMounted(true)

    const loggedIn = searchParams.get("logged_in")
    if (loggedIn === "true") {
      router.replace("/", { scroll: false })
>>>>>>> 53d242c (in9n9)
    }
    checkSession()
  }, [])

<<<<<<< HEAD
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground overflow-hidden relative">
      <AnimatedBackground />

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-16 md:mb-24"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <InteractiveLogo
              width={40}
              height={40}
              containerClassName="rounded-xl shadow-lg shadow-primary/20"
            />
            <span className="text-lg md:text-xl font-bold tracking-tight">ClientNova</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />

            {/* Conditional Sign In / Dashboard Button */}
            <Link href={session ? "/dashboard" : "/auth/login"} className="hidden md:block">
              <Button variant="ghost" className="hover:bg-primary/5">
                {session ? "Dashboard" : "Sign In"}
              </Button>
            </Link>

            {/* Main CTA */}
            <Link href={session ? "/dashboard" : "/auth/sign-up"}>
              <Button className="shadow-lg shadow-primary/25 text-sm md:text-base">
                {session ? "Enter Dashboard" : "Get Started"}
              </Button>
            </Link>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-20 md:mb-32"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-semibold mb-6 md:mb-8 border border-primary/10">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            Premium Brand Management
          </motion.div>
          <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 md:mb-8 text-balance leading-tight tracking-tight">
            Elevate Your Brand <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              To New Heights
            </span>
          </motion.h1>
          <motion.p variants={fadeIn} className="text-base md:text-xl text-gray-700 dark:text-gray-300 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4 font-medium">
            ClientNova is the definitive workspace for visionary brand studios.
            Streamline your workflow with a system as elegant as your designs.
          </motion.p>
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link href={session ? "/dashboard" : "/auth/sign-up"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 md:h-14 px-8 text-base md:text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
                {session ? "Enter Dashboard" : "Start Free Trial"}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Button>
            </Link>
            <Link href={session ? "/dashboard" : "/auth/login"} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 md:h-14 px-8 text-base md:text-lg rounded-full border-primary/20 hover:bg-primary/5 transition-all">
                {session ? "View Features" : "Sign In"}
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Cube / About Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-12 items-center mb-32"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl" />
            <motion.div
              whileHover={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <Image
                src="/landing-cube.png"
                alt="3D Abstract Cube"
                width={600}
                height={600}
                className="w-full h-auto drop-shadow-2xl"
              />
            </motion.div>
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Intelligence that <br />
              <span className="text-primary">Adapts to You</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              ClientNova isn't just a CRM. It's an intelligent operating system designed for the modern agency.
              From automated client reports to predictive project health, every pixel serves a purpose.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Velocity Tracking</h3>
                <p className="text-sm text-muted-foreground">AI-driven project speed analysis.</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Risk Prevention</h3>
                <p className="text-sm text-muted-foreground">Detect issues before they happen.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete suite of tools to manage your clients, projects, and team.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Client Portal", desc: "Give clients a beautiful space to view progress." },
              { icon: Layers, title: "Project Management", desc: "Kanban, lists, and timelines in one place." },
              { icon: Globe, title: "Global Assets", desc: "Manage files and deliverables securely." },
              { icon: Palette, title: "Brand Kits", desc: "Store colors, fonts, and assets for every client." },
              { icon: Sparkles, title: "AI Insights", desc: "Automated daily briefings and reports." },
              { icon: Shield, title: "Secure Access", desc: "Role-based permissions for your team." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-colors"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
=======
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [searchParams, router, supabase])

  if (!isMounted) return null

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col selection:bg-primary/20">
      {/* Background Layer */}
      <FloatingBooks />
      <div className="noise-overlay" />
      <div className="vignette-overlay" />
      <div className="living-gradient" />

      {/* Floating Motion Figures */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <FloatingShape className="w-96 h-96 bg-primary/20 -top-20 -left-20" delay={0} />
        <FloatingShape className="w-[500px] h-[500px] bg-accent/20 bottom-0 right-0" delay={2} />
        <FloatingShape className="w-64 h-64 bg-foreground/5 top-1/2 left-1/3" delay={4} />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 p-8 flex justify-between items-center"
      >
        <MagneticButton>
          <span className="font-serif text-2xl tracking-widest font-bold select-none cursor-pointer text-transparent bg-clip-text bg-gradient-to-br from-neutral-800 via-neutral-500 to-neutral-800 dark:from-white dark:via-neutral-300 dark:to-neutral-500 drop-shadow-sm">NovelAura</span>
        </MagneticButton>

        <div className="flex items-center gap-4 text-sm font-bold tracking-wide">
          <Link href="/about" className="px-5 py-2 rounded-full border border-foreground/10 bg-background/5 hover:bg-foreground/5 transition-all text-foreground/80 hover:text-foreground" data-hoverable="true">Philosophy</Link>
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-6">
              <Link href="/stories" className="px-5 py-2 rounded-full border border-foreground/10 bg-background/5 hover:bg-foreground/5 transition-all text-foreground/80 hover:text-foreground" data-hoverable="true">Library</Link>
              <Link href="/admin/add-story" className="px-5 py-2 rounded-full border border-foreground/10 bg-background/5 hover:bg-foreground/5 transition-all text-foreground/80 hover:text-foreground" data-hoverable="true">Add Story</Link>
              <button onClick={async () => { await supabase.auth.signOut(); router.refresh() }} className="px-5 py-2 rounded-full border border-foreground/10 bg-background/5 hover:bg-foreground/5 transition-all text-foreground/80 hover:text-foreground" data-hoverable="true">Sign Out</button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/stories" className="px-5 py-2 rounded-full border border-foreground/10 bg-background/5 hover:bg-foreground/5 transition-all text-foreground/80 hover:text-foreground" data-hoverable="true">Library</Link>
              <Link href="/admin/add-story" className="px-5 py-2 rounded-full border border-foreground/10 bg-background/5 hover:bg-foreground/5 transition-all text-foreground/80 hover:text-foreground" data-hoverable="true">Add Story</Link>
              <Link href="/login" className="px-5 py-2 rounded-full border border-foreground/10 bg-background/5 hover:bg-foreground/5 transition-all text-foreground/80 hover:text-foreground" data-hoverable="true">Entrance</Link>
            </div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen text-center px-6 z-10 relative">
        <motion.div style={{ y: y1 }} className="absolute top-1/4 left-10 w-4 h-4 rounded-full bg-foreground/20" />
        <motion.div style={{ y: y2 }} className="absolute bottom-1/4 right-20 w-8 h-8 border border-foreground/10 rounded-full" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ opacity }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-3xl mx-auto space-y-16"
        >
          <div className="space-y-8">
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight text-balance-header opacity-90 tracking-tighter cursor-default">
              If your mood was a story, how would it begin?
            </h1>
            <p className="text-xl md:text-2xl font-light text-muted-foreground leading-relaxed max-w-lg mx-auto italic opacity-80">
              We don't search by genre. We search by feeling.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <MagneticButton>
              <Link href="/quiz">
                <div
                  className="group relative inline-flex items-center justify-center py-6 px-12 cursor-pointer overflow-hidden rounded-full border border-foreground/10 bg-background/5 backdrop-blur-sm"
                  data-hoverable="true"
                >
                  <span className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative font-serif text-2xl italic tracking-wide group-hover:tracking-wider transition-all duration-700">
                    Begin Reflection
                  </span>
                </div>
              </Link>
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 2, duration: 1.5 }}
          className="absolute bottom-12 animate-bounce"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        </motion.div>
      </main>

      {/* The Process Section (Below Fold) */}
      <section className="relative z-10 py-32 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 text-center md:text-left">
          {[
            { title: "Reflect", text: "Look inward. Identify your emotional weather." },
            { title: "Discover", text: "We translate your feelings into literary atmospheres." },
            { title: "Immerse", text: "Find the book that understands your silence." }
          ].map((step, i) => (
            <motion.div
              key={step.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={processVariants}
              className="space-y-6"
            >
              <span className="text-xs font-mono opacity-60 font-black">0{i + 1}</span>
              <h3 className="font-serif text-3xl md:text-4xl italic font-bold">{step.title}</h3>
              <p className="text-foreground font-semibold text-lg leading-relaxed max-w-xs">{step.text}</p>
            </motion.div>
          ))}
>>>>>>> 53d242c (in9n9)
        </div>

<<<<<<< HEAD
        {/* Footer - Landscape Layout */}
        <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo & Tagline */}
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="flex items-center gap-2">
                <InteractiveLogo width={32} height={32} containerClassName="rounded-lg" />
                <span className="text-xl font-bold">ClientNova</span>
              </div>
              <p className="text-sm text-muted-foreground hidden md:block border-l border-slate-200 dark:border-slate-800 pl-6 h-5 leading-5">
                The operating system for creative studios.
              </p>
            </div>

            {/* Landscape Links - Company Only */}
            {/* Landscape Links - Company Only */}
            <nav className="flex items-center gap-6 text-sm font-bold text-foreground">
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <Link href="#careers" className="hover:text-primary transition-colors">Careers</Link>
              <Link href="#blog" className="hover:text-primary transition-colors">Blog</Link>
              <Link href="#contact" className="hover:text-primary transition-colors">Contact</Link>
            </nav>
          </div>

          <div className="text-center md:text-left text-xs text-muted-foreground mt-8 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center">
            <span>© 2024 ClientNova Inc. All rights reserved.</span>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-primary">Privacy</Link>
              <Link href="#" className="hover:text-primary">Terms</Link>
            </div>
          </div>
        </footer>

      </div>
=======
      {/* Mood Marquee */}
      <section className="relative z-10 pb-12">
        <MoodMarquee />
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center text-[10px] uppercase tracking-[0.3em] font-light text-muted-foreground opacity-50">
        NovelAura &copy; {new Date().getFullYear()} — Made for introverts
      </footer>
>>>>>>> 53d242c (in9n9)
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  )
}
