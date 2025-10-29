"use client"

import { useEffect, useState } from "react"

export function RetroFooter() {
  const [statusText, setStatusText] = useState("READY.")
  const statuses = ['READY.', 'OK.', 'SYSTEM NORMAL.', 'AWAITING INPUT...']

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % statuses.length
      setStatusText(statuses[currentIndex])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-[var(--bg-color)] border-t-2 border-[var(--border-color)] px-4 text-[20px] flex items-center justify-between relative top-[2px] z-[1000] transition-all backdrop-blur-sm">
      <span className="font-bold">StreamCI (Hi-Bit)</span>
      <span className="transition-opacity duration-300 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-[var(--color-success)] animate-pulse" style={{ animation: 'blink 2s infinite' }} />
        {statusText}
      </span>
    </div>
  )
}
