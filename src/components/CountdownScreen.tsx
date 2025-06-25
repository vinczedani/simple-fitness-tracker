import React, { useEffect, useState } from 'react'
import { audioManager } from '../utils/audio'

interface CountdownScreenProps {
  onComplete: () => void
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3)

  useEffect(() => {
    // Play initial sound when component mounts
    audioManager.playCountdownBeep()

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          audioManager.playStartBeep()
          setTimeout(onComplete, 500) // Small delay before starting
          return 0
        }
        audioManager.playCountdownBeep()
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="countdown-screen">
      <div className="countdown-content">
        <div className="countdown-number pulse">{count}</div>
        <div className="countdown-text">Get Ready!</div>
      </div>
    </div>
  )
}
