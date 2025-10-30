"use client"

import { useTheme } from '@/contexts/theme-context'
import { SetupModern } from '@/components/setup-modern'
import { SetupRetro } from '@/components/setup-retro'

export default function SetupPage() {
  const { theme } = useTheme()

  if (theme === 'retro') {
    return <SetupRetro />
  }

  return <SetupModern />
}
