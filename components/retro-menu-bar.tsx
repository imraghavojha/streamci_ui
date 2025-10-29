"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function RetroMenuBar() {
  const [isDark, setIsDark] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check for saved theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
        setIsDark(true)
      }
    }
  }, [])

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
        setIsDark(false)
      } else {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
        setIsDark(true)
      }
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-[var(--bg-color)] border-b-2 border-[var(--border-color)] flex items-center px-3 z-[1000] transition-all backdrop-blur-sm">
      {/* Logo */}
      <svg
        className="w-5 h-5 mr-2 text-[var(--accent-color)] transition-transform hover:scale-110"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>

      {/* Menu Items */}
      <Link
        href="/"
        className={`px-2.5 py-0.5 text-[20px] tracking-wide relative top-[2px] hover:bg-[var(--fg-color)] hover:text-[var(--bg-color)] transition-all ${
          isActive('/') ? 'bg-[var(--fg-color)] text-[var(--bg-color)]' : ''
        }`}
      >
        StreamCI
      </Link>
      <Link
        href="/dashboard"
        className={`px-2.5 py-0.5 text-[20px] tracking-wide relative top-[2px] hover:bg-[var(--fg-color)] hover:text-[var(--bg-color)] transition-all ${
          isActive('/dashboard') ? 'bg-[var(--fg-color)] text-[var(--bg-color)]' : ''
        }`}
      >
        Dashboard
      </Link>
      <Link
        href="/demo"
        className={`px-2.5 py-0.5 text-[20px] tracking-wide relative top-[2px] hover:bg-[var(--fg-color)] hover:text-[var(--bg-color)] transition-all ${
          isActive('/demo') ? 'bg-[var(--fg-color)] text-[var(--bg-color)]' : ''
        }`}
      >
        Demo
      </Link>

      {/* Right side - Theme toggle and Account */}
      <div className="ml-auto flex items-center">
        <Link
          href="/repositories"
          className={`px-2.5 py-0.5 text-[20px] tracking-wide relative top-[2px] hover:bg-[var(--fg-color)] hover:text-[var(--bg-color)] transition-all ${
            isActive('/repositories') ? 'bg-[var(--fg-color)] text-[var(--bg-color)]' : ''
          }`}
        >
          Account
        </Link>
        <button
          onClick={toggleTheme}
          className="p-0.5 ml-2 relative top-[1px] hover:bg-[var(--fg-color)] transition-all hover:scale-110 group"
          title="Toggle dark mode"
        >
          {/* Sun Icon */}
          <svg
            className={`w-5 h-5 fill-[var(--fg-color)] group-hover:fill-[var(--bg-color)] ${isDark ? 'hidden' : 'block'}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 14c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM10 0v3h-2v-3h2zm-8 7h3v2h-3v-2zm13 0h3v2h-3v-2zm-5 10v3h-2v-3h2zm-8-3h3v2h-3v-2zm13 0h3v2h-3v-2zm-12.2-8.8l-2.1 2.1 1.4 1.4 2.1-2.1-1.4-1.4zm10.6 10.6l-2.1 2.1 1.4 1.4 2.1-2.1-1.4-1.4zM3.9 3.9l-2.1-2.1 1.4-1.4 2.1 2.1-1.4 1.4zm10.6 10.6l-2.1-2.1 1.4-1.4 2.1 2.1-1.4 1.4z"/>
          </svg>
          {/* Moon Icon */}
          <svg
            className={`w-5 h-5 fill-[var(--fg-color)] group-hover:fill-[var(--bg-color)] ${isDark ? 'block' : 'hidden'}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 0c-5.52 0-10 4.48-10 10s4.48 10 10 10c1.85 0 3.58-.51 5.07-1.38-.26-.14-.5-.3-.72-.48-.22-.19-.44-.39-.64-.61-.2-.22-.39-.45-.56-.7-.17-.25-.33-.51-.46-.79-.14-.28-.25-.57-.34-.88-.09-.3-.16-.62-.2-.95-.03-.32-.05-.66-.05-1s.02-.68.05-1 .11-.65.2-.95c.09-.31.2-.6.34-.88.13-.28.29-.54.46-.79.17-.25.36-.48.56-.7.2-.22.42-.42.64-.61.22-.18.46-.34.72-.48a9.91 9.91 0 01-5.07-1.38z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
