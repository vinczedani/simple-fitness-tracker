import React, { useEffect } from 'react'
import { audioManager } from '../utils/audio'
import { CountdownScreen } from './CountdownScreen'
import type { WorkoutConfig } from '../types'

interface TimerScreenProps {
  config: WorkoutConfig
  onStopWorkout: () => void
}

export const TimerScreen: React.FC<TimerScreenProps> = ({
  config,
  onStopWorkout
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = React.useState(0)
  const [currentPhase, setCurrentPhase] = React.useState<'work' | 'rest'>('work')
  const [timeLeft, setTimeLeft] = React.useState(0)
  const [isRunning, setIsRunning] = React.useState(false)
  const [isWorkoutComplete, setIsWorkoutComplete] = React.useState(false)
  const [showCountdown, setShowCountdown] = React.useState(true)

  const startWorkout = () => {
    setShowCountdown(false)
    setIsRunning(true)
  }

  const restartWorkout = () => {
    setCurrentExerciseIndex(0)
    setCurrentPhase('work')
    setTimeLeft(config.exercises[0].workTime)
    setIsRunning(false)
    setIsWorkoutComplete(false)
    setShowCountdown(true)
  }

  // Initialize timer when component mounts
  React.useEffect(() => {
    if (config.exercises.length > 0) {
      setTimeLeft(config.exercises[0].workTime)
    }
  }, [config.exercises])

  // Timer logic
  useEffect(() => {
    let interval: number | undefined

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Phase complete, move to next
            if (currentPhase === 'work') {
              // Check if this is the last exercise
              if (currentExerciseIndex === config.exercises.length - 1) {
                // Workout complete - no rest after last exercise
                setIsRunning(false)
                setIsWorkoutComplete(true)
                audioManager.playWorkoutCompleteBeep()
                return 0
              } else {
                // Move to rest phase
                setCurrentPhase('rest')
                const currentExercise = config.exercises[currentExerciseIndex]
                audioManager.playPhaseChangeBeep()
                return currentExercise?.restTime || 0
              }
            } else {
              // Rest complete, move to next exercise
              if (currentExerciseIndex < config.exercises.length - 1) {
                const nextIndex = currentExerciseIndex + 1
                setCurrentExerciseIndex(nextIndex)
                setCurrentPhase('work')
                const nextExercise = config.exercises[nextIndex]
                audioManager.playPhaseChangeBeep()
                return nextExercise?.workTime || 0
              } else {
                // Workout complete
                setIsRunning(false)
                setIsWorkoutComplete(true)
                audioManager.playWorkoutCompleteBeep()
                return 0
              }
            }
          }

          const nextSec = prev - 1;

          // Play countdown beep for last 3 seconds
          if (nextSec <= 3 && nextSec > 0) {
            audioManager.playCountdownBeep()
          }

          return nextSec
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, currentPhase, currentExerciseIndex, config.exercises])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showCountdown) return // Don't handle shortcuts during countdown

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (isWorkoutComplete) {
            restartWorkout()
          } else {
            setIsRunning(prev => !prev)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (isWorkoutComplete) {
            restartWorkout()
            return
          }
          // Skip to next phase or exercise
          if (currentPhase === 'work') {
            // If there's a rest phase and not the last exercise, go to rest
            if (currentExerciseIndex < config.exercises.length - 1) {
              setCurrentPhase('rest')
              const currentExercise = config.exercises[currentExerciseIndex]
              setTimeLeft(currentExercise?.restTime || 0)
            } else {
              // Last exercise, complete workout
              setIsRunning(false)
              setIsWorkoutComplete(true)
              audioManager.playWorkoutCompleteBeep()
            }
          } else {
            // Currently in rest, go to next exercise
            if (currentExerciseIndex < config.exercises.length - 1) {
              const nextIndex = currentExerciseIndex + 1
              setCurrentExerciseIndex(nextIndex)
              setCurrentPhase('work')
              const nextExercise = config.exercises[nextIndex]
              setTimeLeft(nextExercise?.workTime || 0)
            }
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (isWorkoutComplete) {
            restartWorkout()
            return
          }
          // Go to previous phase or exercise
          if (currentPhase === 'rest') {
            // Go back to work phase of current exercise
            setCurrentPhase('work')
            const currentExercise = config.exercises[currentExerciseIndex]
            setTimeLeft(currentExercise?.workTime || 0)
          } else {
            // Currently in work, go to previous exercise's rest phase if it exists
            if (currentExerciseIndex > 0) {
              const prevExercise = config.exercises[currentExerciseIndex - 1]
              if (prevExercise.restTime > 0) {
                // Go to previous exercise's rest phase
                setCurrentExerciseIndex(prev => prev - 1)
                setCurrentPhase('rest')
                setTimeLeft(prevExercise.restTime)
              } else {
                // Previous exercise has no rest, go to its work phase
                setCurrentExerciseIndex(prev => prev - 1)
                setCurrentPhase('work')
                setTimeLeft(prevExercise.workTime)
              }
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentExerciseIndex, currentPhase, config.exercises, isWorkoutComplete, showCountdown])

  const formatTime = (seconds: number) => {
    // Only show seconds, no minutes
    return seconds.toString()
  }

  if (showCountdown) {
    return <CountdownScreen onComplete={startWorkout} />
  }

  const currentExercise = config.exercises[currentExerciseIndex]
  const backgroundColor = currentPhase === 'work' ? '#22c55e' : '#ef4444'

  // Get upcoming exercise info
  const upcomingExercise = currentExerciseIndex < config.exercises.length - 1
    ? config.exercises[currentExerciseIndex + 1]
    : null

  return (
    <div
      className="timer-screen"
      style={{ backgroundColor }}
    >
      <div className="timer-content">
        <div className="timer-display">
          <div className={`time ${timeLeft <= 3 && timeLeft > 0 ? 'pulse' : ''}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="phase">{currentPhase.toUpperCase()}</div>

          {/* Show current exercise only during work phase */}
          {currentPhase === 'work' && (
            <div className="exercise-name current">{currentExercise?.name}</div>
          )}

          <div className="progress">
            {currentExerciseIndex + 1} of {config.exercises.length}
          </div>

          {/* Upcoming exercise display */}
          {upcomingExercise && (
            <div className="upcoming-exercise">
              <div className="upcoming-label">
                {currentPhase === 'work' ? 'Next:' : 'Coming up:'}
              </div>
              <div className={`upcoming-name ${currentPhase === 'rest' ? 'current' : ''}`}>
                {upcomingExercise.name}
              </div>
            </div>
          )}
        </div>

        <div className="timer-controls">
          <button
            onClick={isWorkoutComplete ? restartWorkout : () => setIsRunning(prev => !prev)}
            className="control-btn"
          >
            {isWorkoutComplete ? 'RESTART' : (isRunning ? 'PAUSE' : 'RESUME')}
          </button>
          <button
            onClick={onStopWorkout}
            className="control-btn"
          >
            STOP
          </button>
        </div>

        <div className="keyboard-hints">
          <div>Space: {isWorkoutComplete ? 'Restart' : 'Pause/Resume'}</div>
          <div>← →: {isWorkoutComplete ? 'Restart' : 'Previous/Next Phase'}</div>
        </div>
      </div>
    </div>
  )
}
