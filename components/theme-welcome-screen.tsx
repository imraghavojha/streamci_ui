"use client"

import { useTheme } from '@/contexts/theme-context'
import { useEffect, useState } from 'react'
import { Monitor, Sparkles } from 'lucide-react'

export function ThemeWelcomeScreen() {
  const { hasSelectedTheme, setTheme, markThemeSelected, theme } = useTheme()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedPreview, setSelectedPreview] = useState<'retro' | 'modern'>('modern')

  useEffect(() => {
    // Show welcome screen after a brief delay if user hasn't selected a theme
    if (!hasSelectedTheme) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [hasSelectedTheme])

  const handleSelectTheme = (theme: 'retro' | 'modern') => {
    setTheme(theme)
    markThemeSelected()
    setIsVisible(false)
  }

  if (!isVisible || hasSelectedTheme) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-card border-2 border-border max-w-2xl w-full rounded-lg shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-primary/10 border-b-2 border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Welcome to StreamCI!</h2>
          </div>
          <p className="text-muted-foreground">
            Choose your preferred theme to get started
          </p>
        </div>

        {/* Theme Options */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Modern Theme */}
            <button
              onClick={() => setSelectedPreview('modern')}
              onDoubleClick={() => handleSelectTheme('modern')}
              className={`group relative rounded-lg border-2 transition-all p-4 text-left ${
                selectedPreview === 'modern'
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-border hover:border-primary/50 hover:scale-102'
              }`}
            >
              <div className="absolute top-2 right-2">
                {selectedPreview === 'modern' && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              <Monitor className="w-12 h-12 text-primary mb-3" />
              <h3 className="text-xl font-bold mb-2">Modern</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Sleek dark theme with vibrant purple and blue accents
              </p>

              {/* Preview */}
              <div className="bg-[oklch(0.145_0.02_240)] rounded p-3 space-y-2">
                <div className="h-2 bg-[oklch(0.6_0.15_264)] rounded w-3/4" />
                <div className="h-2 bg-[oklch(0.269_0.02_240)] rounded w-1/2" />
                <div className="h-2 bg-[oklch(0.6_0.15_264)] rounded w-2/3" />
              </div>
            </button>

            {/* Retro Theme */}
            <button
              onClick={() => setSelectedPreview('retro')}
              onDoubleClick={() => handleSelectTheme('retro')}
              className={`group relative rounded-lg border-2 transition-all p-4 text-left ${
                selectedPreview === 'retro'
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-border hover:border-primary/50 hover:scale-102'
              }`}
            >
              <div className="absolute top-2 right-2">
                {selectedPreview === 'retro' && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              <svg className="w-12 h-12 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <rect x="6" y="6" width="12" height="10" />
                <circle cx="12" cy="18" r="1" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Retro</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Classic Macintosh-inspired theme with clean lines
              </p>

              {/* Preview */}
              <div className="bg-[#fdfaf5] border-2 border-[#4a4a4a] rounded p-3 space-y-2">
                <div className="h-2 bg-[#3b82f6] rounded-none w-3/4" />
                <div className="h-2 bg-[#f0f0f0] rounded-none w-1/2" />
                <div className="h-2 bg-[#3b82f6] rounded-none w-2/3" />
              </div>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => handleSelectTheme(selectedPreview)}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all"
            >
              Continue with {selectedPreview === 'modern' ? 'Modern' : 'Retro'}
            </button>
            <button
              onClick={() => {
                markThemeSelected()
                setIsVisible(false)
              }}
              className="px-6 py-3 rounded-lg font-bold border-2 border-border hover:bg-muted transition-all"
            >
              Skip
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            You can change your theme anytime from the palette icon in the navigation bar
          </p>
        </div>
      </div>
    </div>
  )
}
