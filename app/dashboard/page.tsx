"use client"

import { useTheme } from '@/contexts/theme-context'
import { DashboardModern } from '@/components/dashboard-modern'
import { DashboardRetro } from '@/components/dashboard-retro'
import { DashboardPollingProvider } from '@/contexts/dashboard-polling-context'

function DashboardContent() {
  const { theme } = useTheme()

  if (theme === 'retro') {
    return <DashboardRetro />
  }

  return <DashboardModern />
}

export default function DashboardPage() {
  return (
    <DashboardPollingProvider>
      <DashboardContent />
    </DashboardPollingProvider>
  )
}
