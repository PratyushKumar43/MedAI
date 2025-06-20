"use client"

import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Scroll to top on component mount (page load)
    const mainContentElement = document.getElementById("main-content")
    if (mainContentElement) {
      mainContentElement.scrollTo({ top: 0, behavior: "smooth" })
    }

    const toggleVisibility = () => {
      const mainContentElement = document.getElementById("main-content")
      if (mainContentElement && mainContentElement.scrollTop > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    if (mainContentElement) {
      mainContentElement.addEventListener("scroll", toggleVisibility)
      return () => mainContentElement.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    const mainContentElement = document.getElementById("main-content")
    if (mainContentElement) {
      mainContentElement.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }

  return (
    <>
      {isVisible && (        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-24 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-bounce-in"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </>
  )
}
