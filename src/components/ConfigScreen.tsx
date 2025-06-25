import React from 'react'
import type { Exercise, WorkoutConfig } from '../types'

interface ConfigScreenProps {
  config: WorkoutConfig
  onConfigChange: (config: WorkoutConfig) => void
  onStartWorkout: () => void
}

export const ConfigScreen: React.FC<ConfigScreenProps> = ({
  config,
  onConfigChange,
  onStartWorkout
}) => {
  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: `Exercise ${config.exercises.length + 1}`,
      workTime: 30,
      restTime: 15
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
      <h1>Fitness Timer</h1>

      <div className="exercises-section">
        <h2>Exercises</h2>
        {config.exercises.map((exercise) => (
          <div key={exercise.id} className="exercise-item">
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
                  value={exercise.workTime}
                  onChange={(e) => updateExercise(exercise.id, 'workTime', parseInt(e.target.value) || 0)}
                  min="1"
                  className="time-input"
                />
              </div>
              <div className="time-input-group">
                <label>Rest (s)</label>
                <input
                  type="number"
                  value={exercise.restTime}
                  onChange={(e) => updateExercise(exercise.id, 'restTime', parseInt(e.target.value) || 0)}
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
              value={config.rounds || 1}
              onChange={(e) => onConfigChange({
                ...config,
                rounds: parseInt(e.target.value) || 1
              })}
              min="1"
              className="rounds-input"
            />
          </div>
          <div className="rounds-input-group">
            <label>Break Between Rounds (s)</label>
            <input
              type="number"
              value={config.roundBreakTime || 30}
              onChange={(e) => onConfigChange({
                ...config,
                roundBreakTime: parseInt(e.target.value) || 30
              })}
              min="0"
              className="rounds-input"
            />
          </div>
        </div>
        <div className="total-time">
          Total Workout Time: <strong>{formatTime(calculateTotalTime())}</strong>
        </div>
      </div>

      <button
        onClick={onStartWorkout}
        disabled={config.exercises.length === 0}
        className="start-btn"
      >
        Start Workout
      </button>
    </div>
  )
}
