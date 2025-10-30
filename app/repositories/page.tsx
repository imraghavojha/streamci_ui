"use client"

import { useTheme } from '@/contexts/theme-context'
import { RepositoriesModern } from '@/components/repositories-modern'
import { RepositoriesRetro } from '@/components/repositories-retro'

export default function RepositoriesPage() {
  const { theme } = useTheme()

  if (theme === 'retro') {
    return <RepositoriesRetro />
  }

  return <RepositoriesModern />
}
