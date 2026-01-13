"use client"

import type { Book } from "@/lib/types"
import { motion } from "framer-motion"

interface BookCoverProps {
  book: Book
  onClick?: () => void
  className?: string
}

const gradients = [
  "from-[#1e5a5a] to-[#a8d8e8]",
  "from-[#3d4e6b] to-[#8fa3c2]",
  "from-[#5a3e1f] to-[#d4a574]",
  "from-[#4a3b5c] to-[#b8a8d8]",
  "from-[#2d3d4a] to-[#7eb3c9]",
  "from-[#5c3d2e] to-[#d4a584]",
]

export function BookCover({ book, onClick, className = "" }: BookCoverProps) {
  const gradientIndex = book.id % gradients.length
  const gradient = gradients[gradientIndex]

  return (
    <motion.div
      onClick={onClick}
      className={`relative w-32 h-44 sm:w-40 sm:h-56 rounded-lg overflow-hidden shadow-2xl cursor-pointer group ${className}`}
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 transition-opacity duration-300 group-hover:opacity-95`} />

      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 pattern-lines" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4 text-white transition-all duration-300">
        {/* Top Decorative Element */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0.4 }}
          whileHover={{ opacity: 0.6 }}
        >
          <div className="w-8 sm:w-12 h-0.5 sm:h-1 bg-white/40 rounded-full" />
        </motion.div>

        {/* Center - Title & Author */}
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-1 sm:gap-2">
          <h3 className="font-serif text-sm sm:text-lg font-bold leading-tight line-clamp-3 px-1">{book.title}</h3>
          <div className="h-px w-6 sm:w-8 bg-white/30" />
          <p className="text-[10px] sm:text-xs font-light italic opacity-90">{book.author || 'Unknown Author'}</p>
        </div>

        {/* Bottom - Tags */}
        <div className="flex justify-center gap-1 flex-wrap">
          {(book.tags || []).slice(0, 2).map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm"
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Hover Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"
        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
      />

      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </motion.div>
  )
}
