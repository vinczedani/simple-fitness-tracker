import React from 'react'
import type { SavedWorkout, WorkoutConfig } from '../types'

interface WorkoutListScreenProps {
  savedWorkouts: SavedWorkout[]
  onSelectWorkout: (workout: SavedWorkout) => void
  onEditWorkout: (workout: SavedWorkout) => void
  onDeleteWorkout: (id: string) => void
  onCreateNew: () => void
}

export const WorkoutListScreen: React.FC<WorkoutListScreenProps> = ({
  savedWorkouts,
  onSelectWorkout,
  onEditWorkout,
  onDeleteWorkout,
  onCreateNew
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const calculateTotalTime = (config: WorkoutConfig) => {
    if (config.exercises.length === 0) return 0

    const rounds = config.rounds || 1
    const roundBreakTime = config.roundBreakTime || 0

    const timePerRound = config.exercises.reduce((total, exercise) => {
      return total + exercise.workTime + exercise.restTime
    }, 0)

    return (timePerRound * rounds) + (roundBreakTime * (rounds - 1))
  }

  return (
    <div className="workout-list-screen">
      <div className="workout-list-header">
        <h1 className="workout-list-title">Workouts</h1>
        <button onClick={onCreateNew} className="create-workout-btn">
          + <span className="create-workout-btn-text">Create New Workout</span>
        </button>
      </div>

      {savedWorkouts.length === 0 ? (
        <div className="empty-state">
          <p>No workouts yet. Create your first workout to get started!</p>
        </div>
      ) : (
        <div className="workout-grid">
          {savedWorkouts.map((workout) => (
            <div key={workout.id} className="workout-card" onClick={() => onEditWorkout(workout)}>
              <div className="workout-header">
                <h3>{workout.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteWorkout(workout.id)
                  }}
                  className="delete-workout-btn"
                >
                  ×
                </button>
              </div>

              <div className="workout-details">
                <div className="workout-stats">
                  <span>{workout.config.exercises.length} exercises</span>
                  <span>{workout.config.rounds || 1} round{workout.config.rounds !== 1 ? 's' : ''}</span>
                </div>

                <div className="workout-time">
                  <span className="time-label">Time:</span>
                  <span className="time-value">{formatTime(calculateTotalTime(workout.config))}</span>
                </div>

                <div className="workout-exercises">
                  {workout.config.exercises.slice(0, 8).map((exercise, index) => (
                    <span key={exercise.id} className="exercise-pill">
                      {exercise.name}
                    </span>
                  ))}
                  {workout.config.exercises.length > 8 && (
                    <span className="exercise-pill more">
                      +{workout.config.exercises.length - 8} more
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectWorkout(workout)
                }}
                className="select-workout-btn"
              >
                Start Workout
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
