"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type ThemeType = 'retro' | 'modern'
type DarkMode = 'light' | 'dark'

interface ThemeContextType {
  theme: ThemeType
  darkMode: DarkMode
  setTheme: (theme: ThemeType) => void
  toggleDarkMode: () => void
  hasSelectedTheme: boolean
  markThemeSelected: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('modern')
  const [darkMode, setDarkMode] = useState<DarkMode>('dark')
  const [hasSelectedTheme, setHasSelectedTheme] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme preferences from localStorage
    const savedTheme = localStorage.getItem('streamci-theme') as ThemeType
    const savedDarkMode = localStorage.getItem('streamci-dark-mode') as DarkMode
    const themeSelected = localStorage.getItem('streamci-theme-selected')

    if (savedTheme) {
      setThemeState(savedTheme)
    }
    if (savedDarkMode) {
      setDarkMode(savedDarkMode)
    }
    if (!themeSelected) {
      setHasSelectedTheme(false)
    }

    // Apply initial theme
    applyTheme(savedTheme || 'modern', savedDarkMode || 'dark')
  }, [])

  const applyTheme = (newTheme: ThemeType, newDarkMode: DarkMode) => {
    const root = document.documentElement

    // Remove existing theme classes
    root.classList.remove('theme-retro', 'theme-modern', 'dark', 'light')

    // Add new theme class
    root.classList.add(`theme-${newTheme}`)

    // Add dark mode class
    if (newDarkMode === 'dark') {
      root.classList.add('dark')
    }
  }

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme)
    localStorage.setItem('streamci-theme', newTheme)
    applyTheme(newTheme, darkMode)
  }

  const toggleDarkMode = () => {
    const newDarkMode = darkMode === 'dark' ? 'light' : 'dark'
    setDarkMode(newDarkMode)
    localStorage.setItem('streamci-dark-mode', newDarkMode)
    applyTheme(theme, newDarkMode)
  }

  const markThemeSelected = () => {
    setHasSelectedTheme(true)
    localStorage.setItem('streamci-theme-selected', 'true')
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        darkMode,
        setTheme,
        toggleDarkMode,
        hasSelectedTheme,
        markThemeSelected,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
