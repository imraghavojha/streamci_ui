"use client"

import { useTheme } from '@/contexts/theme-context'
import { DemoModern } from '@/components/demo-modern'
import { DemoRetro } from '@/components/demo-retro'

export default function DemoPage() {
  const { theme } = useTheme()

  if (theme === 'retro') {
    return <DemoRetro />
  }

  return <DemoModern />
}
