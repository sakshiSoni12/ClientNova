<<<<<<< HEAD
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import CelestialBloomShader from "@/components/ui/celestial-bloom-shader"
import FloatingParticles from "@/components/motion/floating-particles"
import { RBACProvider } from "@/components/providers/rbac-provider"
import { GlobalErrorSilencer } from "@/components/providers/global-error-silencer"


import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
=======
import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-serif',
  display: 'swap',
});

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
});
>>>>>>> 53d242c (in9n9)

export const metadata: Metadata = {
  title: "ClientNova - Premium Client Management",
  description: "Luxury client management system for brand studios",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
<<<<<<< HEAD
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-transparent">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="clientnova-theme">
          <RBACProvider>
            <GlobalErrorSilencer />
            {/* <CelestialBloomShader /> */}
            {/* <FloatingParticles /> */}
            {children}
          </RBACProvider>
=======
    <html lang="en" className={`${playfair.variable} ${lato.variable}`} suppressHydrationWarning>
      <body className={`${lato.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
>>>>>>> 53d242c (in9n9)
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
