import React from 'react'
import type { Exercise, WorkoutConfig } from '../types'

interface ConfigScreenProps {
  config: WorkoutConfig
  workoutName: string
  onConfigChange: (config: WorkoutConfig) => void
  onWorkoutNameChange: (name: string) => void
  onStartWorkout: () => void
  onBackToList: () => void
  isNewWorkout?: boolean
}

export const ConfigScreen: React.FC<ConfigScreenProps> = ({
  config,
  workoutName,
  onConfigChange,
  onWorkoutNameChange,
  onStartWorkout,
  onBackToList,
  isNewWorkout
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: `Exercise ${config.exercises.length + 1}`,
      workTime: 30,
      restTime: 20
    }
    onConfigChange({
      ...config,
      exercises: [...config.exercises, newExercise]
    })
  }

  const updateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    onConfigChange({
      ...config,
      exercises: config.exercises.map(ex =>
        ex.id === id ? { ...ex, [field]: value } : ex
      )
    })
  }

  const removeExercise = (id: string) => {
    onConfigChange({
      ...config,
      exercises: config.exercises.filter(ex => ex.id !== id)
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newExercises = [...config.exercises]
    const [draggedExercise] = newExercises.splice(draggedIndex, 1)
    newExercises.splice(dropIndex, 0, draggedExercise)

    onConfigChange({
      ...config,
      exercises: newExercises
    })

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const calculateTotalTime = () => {
    if (config.exercises.length === 0) return 0

    const rounds = config.rounds || 1
    const roundBreakTime = config.roundBreakTime || 0

    // Calculate time for one round: sum of all work + rest times
    const timePerRound = config.exercises.reduce((total, exercise) => {
      return total + exercise.workTime + exercise.restTime
    }, 0)

    // Total time = (time per round * rounds) + (round breaks * (rounds - 1))
    const totalTime = (timePerRound * rounds) + (roundBreakTime * (rounds - 1))

    return totalTime
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return (
    <div className="config-screen">
      <div className="config-header">
        <button onClick={onBackToList} className="back-btn">
          ← <span className="back-btn-text">Back to Workouts</span>
        </button>
        <h1>{isNewWorkout ? 'Create New Workout' : 'Edit Workout'}</h1>
      </div>

      <div className="workout-name-section">
        <h2>Workout Name</h2>
        <input
          type="text"
          value={workoutName}
          onChange={(e) => onWorkoutNameChange(e.target.value)}
          placeholder="Enter workout name"
          className="workout-name-input"
        />
      </div>

      <div className="exercises-section">
        <h2>Exercises</h2>
        {config.exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className={`exercise-item ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="drag-handle" title="Drag to reorder">
              ⋮⋮
            </div>
            <input
              type="text"
              value={exercise.name}
              onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
              placeholder="Exercise name"
              className="exercise-name-input"
            />
            <div className="time-inputs">
              <div className="time-input-group">
                <label>Work (s)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={exercise.workTime}
                  onChange={(e) => updateExercise(exercise.id, 'workTime', parseInt(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="1"
                  className="time-input"
                />
              </div>
              <div className="time-input-group">
                <label>Rest (s)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={exercise.restTime}
                    onChange={(e) => updateExercise(exercise.id, 'restTime', parseInt(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="0"
                  className="time-input"
                />
              </div>
            </div>
            <button
              onClick={() => removeExercise(exercise.id)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        ))}

        <button onClick={addExercise} className="add-exercise-btn">
          + Add Exercise
        </button>
      </div>

      <div className="rounds-section">
        <h2>Rounds</h2>
        <div className="rounds-config">
          <div className="rounds-input-group">
            <label>Number of Rounds</label>
            <input
              type="number"
              inputMode="numeric"
              value={config.rounds}
              onChange={(e) => onConfigChange({
                ...config,
                rounds: parseInt(e.target.value)
              })}
              onFocus={(e) => e.target.select()}
              min="1"
              className="rounds-input"
            />
          </div>
          <div className="rounds-input-group">
            <label>Break (s)</label>
            <input
              type="number"
              inputMode="numeric"
              value={config.roundBreakTime}
              onChange={(e) => onConfigChange({
                ...config,
                roundBreakTime: parseInt(e.target.value)
              })}
              onFocus={(e) => e.target.select()}
              min="0"
              className="rounds-input"
            />
          </div>
        </div>
        <div className="total-time">
          Total Workout Time: <strong>{formatTime(calculateTotalTime())}</strong>
        </div>
      </div>

      <div className="action-buttons">
        <button
          onClick={onStartWorkout}
          disabled={config.exercises.length === 0 || !workoutName.trim()}
          className="start-btn"
        >
          Start Workout
        </button>
      </div>
    </div>
  )
}
