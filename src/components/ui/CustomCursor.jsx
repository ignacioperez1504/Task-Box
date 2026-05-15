import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      
      // Update DOM nodes directly for zero-latency tracking
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        id="cursor-dot"
        style={{
          left: 0,
          top: 0,
          transition: 'none',
        }}
      />
      <div
        ref={ringRef}
        id="cursor-ring"
        style={{
          left: 0,
          top: 0,
          width: '24px',
          height: '24px',
          border: '1.5px solid #1B3A35',
          transition: 'none',
        }}
      />
    </>
  )
}
