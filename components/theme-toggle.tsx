"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    console.log("[v0] Theme mounted:", theme)
  }, [theme])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    console.log("[v0] Switching theme from", theme, "to", newTheme)
    setTheme(newTheme)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
<<<<<<< HEAD
      onClick={toggleTheme}
      className="relative"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
=======
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-10 w-10 bg-transparent hover:bg-transparent transition-opacity duration-1000 ease-in-out opacity-60 hover:opacity-100"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ opacity: 1, rotate: isDark ? 90 : 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        key={theme}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-foreground/80" />
        ) : (
          <Moon className="h-4 w-4 text-foreground/80" />
        )}
      </motion.div>
>>>>>>> 53d242c (in9n9)
    </Button>
  )
}
