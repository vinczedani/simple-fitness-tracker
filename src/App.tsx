import { useState, useEffect } from 'react'
import { ConfigScreen } from './components/ConfigScreen'
import { TimerScreen } from './components/TimerScreen'
import type { WorkoutConfig } from './types'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState<'config' | 'timer'>('config')
  const [config, setConfig] = useState<WorkoutConfig>({ exercises: [] })

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('fitness-tracker-config')
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      if (config.exercises.length > 0) {
        setConfig(config)
      }
    }
  }, [])

  // Save config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('fitness-tracker-config', JSON.stringify(config))
  }, [config])

  const handleStartWorkout = () => {
    if (config.exercises.length === 0) return
    setCurrentScreen('timer')
  }

  const handleStopWorkout = () => {
    setCurrentScreen('config')
  }

  if (currentScreen === 'timer') {
    return (
      <TimerScreen
        config={config}
        onStopWorkout={handleStopWorkout}
      />
    )
  }

  return (
    <ConfigScreen
      config={config}
      onConfigChange={setConfig}
      onStartWorkout={handleStartWorkout}
    />
  )
}

export default App
