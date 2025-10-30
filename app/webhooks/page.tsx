"use client"

import { useTheme } from '@/contexts/theme-context'
import { WebhooksModern } from '@/components/webhooks-modern'
import { WebhooksRetro } from '@/components/webhooks-retro'

export default function WebhooksPage() {
  const { theme } = useTheme()

  if (theme === 'retro') {
    return <WebhooksRetro />
  }

  return <WebhooksModern />
}
