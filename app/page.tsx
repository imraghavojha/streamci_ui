"use client"

import { useTheme } from '@/contexts/theme-context'
import { HomepageModern } from '@/components/homepage-modern'
import { HomepageRetro } from '@/components/homepage-retro'

export default function LandingPage() {
  const { theme } = useTheme()

  if (theme === 'retro') {
    return <HomepageRetro />
  }

  return <HomepageModern />
}
