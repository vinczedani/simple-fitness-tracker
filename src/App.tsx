import { useState, useEffect } from 'react'
import { ConfigScreen } from './components/ConfigScreen'
import { TimerScreen } from './components/TimerScreen'
import type { WorkoutConfig } from './types'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState<'config' | 'timer'>('config')
  const [config, setConfig] = useState<WorkoutConfig>({
    exercises: [],
    rounds: 1,
    roundBreakTime: 30
  })

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('fitness-tracker-config')
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig)
      // Ensure backward compatibility with old configs that don't have rounds
      if (parsedConfig.exercises.length > 0) {
        setConfig({
          exercises: parsedConfig.exercises,
          rounds: parsedConfig.rounds || 1,
          roundBreakTime: parsedConfig.roundBreakTime || 30
        })
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
