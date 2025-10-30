"use client"

import { useTheme } from '@/contexts/theme-context'
import { Palette } from 'lucide-react'
import { useState } from 'react'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeChange = (newTheme: 'retro' | 'modern') => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-0.5 text-[20px] tracking-wide relative top-[2px] hover:bg-[var(--fg-color)] hover:text-[var(--bg-color)] transition-all flex items-center gap-1"
        title="Change theme"
      >
        <Palette className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 bg-card border-2 border-border shadow-lg z-50 min-w-[200px]">
            <div className="p-2">
              <div className="text-sm font-bold mb-2 px-2">Choose Theme</div>

              <button
                onClick={() => handleThemeChange('modern')}
                className={`w-full text-left px-3 py-2 hover:bg-muted transition-colors ${
                  theme === 'modern' ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <div className="font-bold">Modern</div>
                <div className="text-xs opacity-75">Dark purple & blue</div>
              </button>

              <button
                onClick={() => handleThemeChange('retro')}
                className={`w-full text-left px-3 py-2 hover:bg-muted transition-colors ${
                  theme === 'retro' ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <div className="font-bold">Retro</div>
                <div className="text-xs opacity-75">Classic Macintosh</div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
