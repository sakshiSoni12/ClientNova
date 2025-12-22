"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Shield, Zap, Users, Palette, Globe, Layers } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { AnimatedBackground } from "@/components/animated-background"

export default function LandingPage() {
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
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight">ClientNova</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Link href="/auth/login" className="hidden md:block">
              <Button variant="ghost" className="hover:bg-primary/5">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="shadow-lg shadow-primary/25 text-sm md:text-base">Get Started</Button>
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
          <motion.p variants={fadeIn} className="text-base md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            ClientNova is the definitive workspace for visionary brand studios.
            Streamline your workflow with a system as elegant as your designs.
          </motion.p>
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link href="/auth/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 md:h-14 px-8 text-base md:text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
                Start Free Trial
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 md:h-14 px-8 text-base md:text-lg rounded-full border-primary/20 hover:bg-primary/5 transition-all">
                View Dashboard
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* About Section */}
        <motion.section
          className="mb-24 md:mb-32 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Mobile-optimized grid: Image first, then text */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-1">
                <div className="w-full h-full rounded-2xl bg-card/50 backdrop-blur-sm border border-white/10 flex items-center justify-center p-6 md:p-8">
                  <div className="grid grid-cols-2 gap-3 md:gap-4 w-full h-full">
                    <div className="bg-primary/10 rounded-xl animate-pulse" />
                    <div className="bg-primary/20 rounded-xl" />
                    <div className="bg-primary/15 rounded-xl" />
                    <div className="bg-primary/5 rounded-xl animate-pulse delay-75" />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Built for Creators, by Creators</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                We understand the chaotic nature of running a creative studio. Missing files, scattered feedback, and endless email chains kill creativity.
              </p>
              <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
                ClientNova was born from this frustration. We wanted a sanctuary for your data—a place where organization meets inspiration.
              </p>
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-bold text-primary">500+</span>
                  <span className="text-xs md:text-sm text-muted-foreground">Studios Trust Us</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-bold text-primary">10k+</span>
                  <span className="text-xs md:text-sm text-muted-foreground">Projects Delivered</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Services Section */}
        <motion.section
          className="mb-24 md:mb-32"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Our Core Services</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your brand studio effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Brand Identity", icon: Palette, desc: "Manage logos, guidelines, and assets." },
              { title: "Web Design", icon: Globe, desc: "Collaborate on wireframes and live sites." },
              { title: "Digital Strategy", icon: Layers, desc: "Plan campaigns and track analytics." },
              { title: "Consultation", icon: Users, desc: "Schedule and manage client meetings." }
            ].map((service, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                whileHover={{ y: -5 }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <service.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto pb-12">
          <motion.div
            className="glass rounded-2xl p-6 md:p-8 border border-white/20 dark:border-white/5"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-3">Secure & Private</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Enterprise-grade security with row-level protection for all your sensitive client data.
            </p>
          </motion.div>

          <motion.div
            className="glass rounded-2xl p-6 md:p-8 border border-white/20 dark:border-white/5"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-3">Lightning Fast</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Real-time updates and seamless performance across all your devices.
            </p>
          </motion.div>

          <motion.div
            className="glass rounded-2xl p-6 md:p-8 border border-white/20 dark:border-white/5"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-3">Beautiful Design</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Crafted with meticulous attention to detail for a luxury experience.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

