"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ArrowLeft } from "lucide-react"

export function FloatingHomeButton() {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  // Don't show the button on the landing page
  if (pathname === "/") {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/">
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        >
          {/* Main Icon */}
          <Home className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
          
          {/* Hover Tooltip */}
          <div className={`absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg transition-all duration-300 whitespace-nowrap ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}>
            <span className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Landing</span>
            </span>
            {/* Tooltip Arrow */}
            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>

          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-300 transform group-hover:scale-150"></div>
        </button>
      </Link>
    </div>
  )
}
