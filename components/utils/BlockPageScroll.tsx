import React, { useEffect, useRef } from 'react'

export const BlockPageScroll = ({ children }: { children: JSX.Element }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (scrollEl) {
      scrollEl.addEventListener('wheel', stopScroll)
      return () => scrollEl.removeEventListener('wheel', stopScroll)
    }

  }, [])
  const stopScroll = (e: WheelEvent) => e.preventDefault()
  return (
    <div ref={scrollRef}>
      {children}
    </div>
  )
}
