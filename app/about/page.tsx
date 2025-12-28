"use client"

import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Sparkles, Star, ArrowRight, Users, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AboutPage() {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    }

    // Generic Team Data
    const team = Array(6).fill(null).map((_, i) => ({
        name: "Team Member",
        role: "Open Position",
        icon: true
    }))

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Header / Nav */}
            <header className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/20 shadow-sm">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                    </Link>
                    <span className="text-xl font-bold tracking-tight">ClientNova</span>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/">
                        <Button variant="ghost" className="hover:bg-accent hover:text-accent-foreground gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                <div className="container mx-auto max-w-6xl relative z-10">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={fadeIn}
                        className="mb-16"
                    >
                        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground/90 to-foreground/50">
                            About us
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl">
                            We are building the operating system for the next generation of creative studios.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="relative rounded-3xl overflow-hidden aspect-[21/9] border border-border shadow-2xl bg-card flex items-center justify-center"
                    >
                        <Image
                            src="/team-culture.jpg"
                            alt="ClientNova Team Culture"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                    </motion.div>
                </div>
            </section>

            {/* Mission & Team */}
            <section className="py-24 px-6 relative bg-muted/50">
                <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-20">
                    {/* Text Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold mb-6 leading-tight">
                                We play to win. Period. ClientNova is built by former agency owners turned builders.
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                We run our projects like we trained—focused, relentless, and always pushing the edge.
                                We believed the creative industry deserved better tools, so we built them.
                            </p>
                        </div>

                        <div className="pt-8">
                            <h3 className="text-2xl font-bold mb-8">Meet the Team</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {team.map((member, i) => (
                                    <div key={i} className="group relative bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-all dark:hover:bg-white/5">
                                        <div className="aspect-square relative rounded-xl overflow-hidden mb-3 bg-primary/10 flex items-center justify-center">
                                            <Users className="w-8 h-8 text-primary/50" />
                                        </div>
                                        <h4 className="font-semibold text-sm leading-tight">{member.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{member.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: FAQ & Testimonials */}
                    <div className="space-y-16">
                        {/* FAQ */}
                        <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
                            <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-border">
                                    <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline">Do you only work with startups?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        No, we work with agencies of all sizes, from boutique studios to global firms.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2" className="border-border">
                                    <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline">How long does implementation take?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        <span className="text-primary font-medium">Scope-dependent. But we move fast.</span> Usually 2-4 weeks.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3" className="border-border">
                                    <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline">Do you offer post-launch support?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Yes, our dedicated success team is available 24/7 to ensure your operations run smoothly.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <div className="mt-6">
                                <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                                    Start a Project <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>

                        {/* Testimonials */}
                        <div>
                            <h3 className="text-2xl font-bold mb-8">What people are saying about us</h3>
                            <div className="grid gap-4">
                                {[
                                    { name: "Client Name", role: "Location", text: "Exceptional service and tools." },
                                    { name: "Agency Partner", role: "Location", text: "Transformed how we manage our entire client roster. " }
                                ].map((t, i) => (
                                    <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                                        <div className="flex gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />)}
                                        </div>
                                        <p className="text-sm text-foreground mb-4 leading-relaxed">"{t.text}"</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden relative flex items-center justify-center">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">{t.name}</div>
                                                <div className="text-xs text-muted-foreground">{t.role}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-24 px-6 text-center border-t border-border bg-background">
                <div className="container mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                        Build. Scale. Dominate.
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Your business deserves more than just a website—it needs a high-performance operating system.
                    </p>
                    <Link href="/">
                        <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/20">
                            Get Performance Now
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
