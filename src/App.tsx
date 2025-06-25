import { useState, useEffect } from 'react'
import { ConfigScreen } from './components/ConfigScreen'
import { TimerScreen } from './components/TimerScreen'
import { WorkoutListScreen } from './components/WorkoutListScreen'
import type { WorkoutConfig, SavedWorkout } from './types'
import './App.css'

type Screen = 'list' | 'config' | 'timer'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list')
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([])
  const [currentWorkout, setCurrentWorkout] = useState<SavedWorkout | null>(null)
  const [editingWorkout, setEditingWorkout] = useState<SavedWorkout | null>(null)
  const [workoutName, setWorkoutName] = useState('')

  // Load saved workouts from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fitness-tracker-workouts')
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log('Loaded workouts from localStorage:', parsed)
        if (parsed?.length > 0) {
          setSavedWorkouts(parsed)
        } else {
          console.log('No saved workouts found in localStorage')
        }
      } else {
        console.log('No saved workouts found in localStorage')
      }
    } catch (error) {
      console.error('Failed to parse saved workouts:', error)
      // Try to recover by clearing corrupted data
      localStorage.removeItem('fitness-tracker-workouts')
    }
  }, [])

  // Save workouts to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('fitness-tracker-workouts', JSON.stringify(savedWorkouts))
      console.log('Saved workouts to localStorage:', savedWorkouts)
    } catch (error) {
      console.error('Failed to save workouts to localStorage:', error)
    }
  }, [savedWorkouts])

  const handleCreateNew = () => {
    const newWorkout: SavedWorkout = {
      id: Date.now().toString(),
      name: '',
      config: {
        exercises: [],
        rounds: 1,
        roundBreakTime: 30
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    setEditingWorkout(newWorkout)
    setWorkoutName('')

    // Immediately save the new workout to localStorage
    setSavedWorkouts(prev => [...prev, newWorkout])

    setCurrentScreen('config')
  }

  const handleSelectWorkout = (workout: SavedWorkout) => {
    setCurrentWorkout(workout)
    setCurrentScreen('timer')
  }

  const handleEditWorkout = (workout: SavedWorkout) => {
    setEditingWorkout(workout)
    setWorkoutName(workout.name)
    setCurrentScreen('config')
  }

  const handleDeleteWorkout = (id: string) => {
    setSavedWorkouts(prev => prev.filter(w => w.id !== id))
  }

  const handleConfigChange = (config: WorkoutConfig) => {
    if (!editingWorkout) return

    const updatedWorkout: SavedWorkout = {
      ...editingWorkout,
      config,
      updatedAt: Date.now()
    }

    setEditingWorkout(updatedWorkout)

    // Auto-save to localStorage
    setSavedWorkouts(prev => {
      const existingIndex = prev.findIndex(w => w.id === updatedWorkout.id)
      if (existingIndex >= 0) {
        const newWorkouts = [...prev]
        newWorkouts[existingIndex] = updatedWorkout
        return newWorkouts
      } else {
        return [...prev, updatedWorkout]
      }
    })
  }

  const handleWorkoutNameChange = (name: string) => {
    setWorkoutName(name)

    if (!editingWorkout) return

    const updatedWorkout: SavedWorkout = {
      ...editingWorkout,
      name: name.trim(),
      updatedAt: Date.now()
    }

    setEditingWorkout(updatedWorkout)

    // Auto-save to localStorage
    setSavedWorkouts(prev => {
      const existingIndex = prev.findIndex(w => w.id === updatedWorkout.id)
      if (existingIndex >= 0) {
        const newWorkouts = [...prev]
        newWorkouts[existingIndex] = updatedWorkout
        return newWorkouts
      } else {
        return [...prev, updatedWorkout]
      }
    })
  }

  const handleStartWorkout = () => {
    if (!editingWorkout || !workoutName.trim()) return

    const workoutToStart: SavedWorkout = {
      ...editingWorkout,
      name: workoutName.trim(),
      config: editingWorkout.config,
      updatedAt: Date.now()
    }

    setCurrentWorkout(workoutToStart)
    setCurrentScreen('timer')
  }

  const handleBackToList = () => {
    setCurrentScreen('list')
    setEditingWorkout(null)
    setWorkoutName('')
  }

  const handleStopWorkout = () => {
    setCurrentScreen('list')
    setCurrentWorkout(null)
  }

  if (currentScreen === 'timer' && currentWorkout) {
    return (
      <TimerScreen
        config={currentWorkout.config}
        onStopWorkout={handleStopWorkout}
      />
    )
  }

  if (currentScreen === 'config' && editingWorkout) {
    return (
      <ConfigScreen
        config={editingWorkout.config}
        workoutName={workoutName}
        onConfigChange={handleConfigChange}
        onWorkoutNameChange={handleWorkoutNameChange}
        onStartWorkout={handleStartWorkout}
        onBackToList={handleBackToList}
        isNewWorkout={!savedWorkouts.find(w => w.id === editingWorkout.id)}
      />
    )
  }

  return (
    <WorkoutListScreen
      savedWorkouts={savedWorkouts}
      onSelectWorkout={handleSelectWorkout}
      onDeleteWorkout={handleDeleteWorkout}
      onCreateNew={handleCreateNew}
      onEditWorkout={handleEditWorkout}
    />
  )
}

export default App
