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
  const [currentPhase, setCurrentPhase] = React.useState<'work' | 'rest' | 'roundBreak'>('work')
  const [timeLeft, setTimeLeft] = React.useState(0)
  const [isRunning, setIsRunning] = React.useState(false)
  const [isWorkoutComplete, setIsWorkoutComplete] = React.useState(false)
  const [showCountdown, setShowCountdown] = React.useState(true)
  const [currentRound, setCurrentRound] = React.useState(1)
  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)
  const [wakeLock, setWakeLock] = React.useState<any>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Screen wake lock functionality
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const wakeLockSentinel = await (navigator as any).wakeLock.request('screen')
        setWakeLock(wakeLockSentinel)

        // Handle wake lock release
        wakeLockSentinel.addEventListener('release', () => {
          setWakeLock(null)
        })
      }
    } catch (err) {
      console.log('Wake Lock not supported or permission denied')
    }
  }

  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release()
      setWakeLock(null)
    }
  }

  // Manage wake lock based on workout state
  useEffect(() => {
    if (isRunning && !showCountdown && !isWorkoutComplete) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [isRunning, showCountdown, isWorkoutComplete])

  // Cleanup wake lock on component unmount
  useEffect(() => {
    return () => {
      releaseWakeLock()
    }
  }, [])

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
    setCurrentRound(1)
  }

  // Common transition functions
  const transitionToRest = () => {
    setCurrentPhase('rest')
    const currentExercise = config.exercises[currentExerciseIndex]
    const restTime = currentExercise?.restTime || 0
    setTimeLeft(restTime)
    audioManager.playPhaseChangeBeep()
    return restTime
  }

  const transitionToNextExercise = () => {
    const nextIndex = currentExerciseIndex + 1
    setCurrentExerciseIndex(nextIndex)
    setCurrentPhase('work')
    const nextExercise = config.exercises[nextIndex]
    const workTime = nextExercise?.workTime || 0
    setTimeLeft(workTime)
    audioManager.playPhaseChangeBeep()
    return workTime
  }

  const transitionToRoundBreak = () => {
    setCurrentPhase('roundBreak')
    const breakTime = config.roundBreakTime || 30
    setTimeLeft(breakTime)
    audioManager.playPhaseChangeBeep()
    return breakTime
  }

  const transitionToNextRound = () => {
    const nextRound = currentRound + 1
    setCurrentRound(nextRound)
    setCurrentExerciseIndex(0)
    setCurrentPhase('work')
    const firstExercise = config.exercises[0]
    const workTime = firstExercise?.workTime || 0
    setTimeLeft(workTime)
    audioManager.playStartBeep()
    return workTime
  }

  const completeWorkout = () => {
    setIsRunning(false)
    setIsWorkoutComplete(true)
    audioManager.playWorkoutCompleteBeep()
    return 0
  }

  const goToPreviousExercise = () => {
    const prevExercise = config.exercises[currentExerciseIndex - 1]
    if (prevExercise.restTime > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
      setCurrentPhase('rest')
      setTimeLeft(prevExercise.restTime)
    } else {
      setCurrentExerciseIndex(prev => prev - 1)
      setCurrentPhase('work')
      setTimeLeft(prevExercise.workTime)
    }
  }

  const goToPreviousRound = () => {
    const prevRound = currentRound - 1
    setCurrentRound(prevRound)
    setCurrentExerciseIndex(config.exercises.length - 1)
    setCurrentPhase('roundBreak')
    setTimeLeft(config.roundBreakTime || 30)
  }

  // Arrow key handlers
  const handleRightArrow = () => {
    if (isWorkoutComplete) {
      restartWorkout()
      return
    }
    // Skip to next phase or exercise
    if (currentPhase === 'work') {
      // Check if this is the last exercise of the current round
      if (currentExerciseIndex === config.exercises.length - 1) {
        // Last exercise of current round - check if we need rest
        if (currentRound < (config.rounds || 1)) {
          // Not the last round, go to rest first
          transitionToRest()
        } else {
          // Last round, workout complete - no rest needed
          completeWorkout()
        }
      } else {
        // Not the last exercise, go to rest
        transitionToRest()
      }
    } else if (currentPhase === 'rest') {
      // Currently in rest, go to next exercise or round
      if (currentExerciseIndex < config.exercises.length - 1) {
        // Not the last exercise, go to next exercise
        transitionToNextExercise()
      } else {
        // Last exercise of current round - check if we need to go to next round
        if (currentRound < (config.rounds || 1)) {
          transitionToRoundBreak()
        } else {
          // Last round, complete workout
          completeWorkout()
        }
      }
    } else if (currentPhase === 'roundBreak') {
      // Currently in round break, start next round
      transitionToNextRound()
    }
  }

  const handleLeftArrow = () => {
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
    } else if (currentPhase === 'roundBreak') {
      // Go back to rest phase of last exercise of previous round
      setCurrentPhase('rest')
      const lastExercise = config.exercises[config.exercises.length - 1]
      setTimeLeft(lastExercise?.restTime || 0)
    } else if (currentPhase === 'work') {
      // Currently in work, go to previous exercise or round
      if (currentExerciseIndex > 0) {
        // Go to previous exercise's rest phase if it exists
        goToPreviousExercise()
      } else if (currentRound > 1) {
        // First exercise of current round, go back to previous round's break
        goToPreviousRound()
      }
    }
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
              // Check if this is the last exercise of the current round
              if (currentExerciseIndex === config.exercises.length - 1) {
                // Last exercise of current round - check if we need rest
                if (currentRound < (config.rounds || 1)) {
                  // Not the last round, go to rest first
                  return transitionToRest()
                } else {
                  // Last round, workout complete - no rest needed
                  return completeWorkout()
                }
              } else {
                // Move to rest phase
                return transitionToRest()
              }
            } else if (currentPhase === 'rest') {
              // Rest complete, move to next exercise or round
              if (currentExerciseIndex < config.exercises.length - 1) {
                // Not the last exercise, go to next exercise
                return transitionToNextExercise()
              } else {
                // Last exercise of current round - check if we need to go to next round
                if (currentRound < (config.rounds || 1)) {
                  // Not the last round, go to round break
                  return transitionToRoundBreak()
                } else {
                  // Last round, workout complete
                  return completeWorkout()
                }
              }
            } else if (currentPhase === 'roundBreak') {
              // Round break complete, start next round
              return transitionToNextRound()
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
  }, [isRunning, timeLeft, currentPhase, currentExerciseIndex, currentRound, config.exercises, config.rounds, config.roundBreakTime])

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
          handleRightArrow()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleLeftArrow()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentExerciseIndex, currentPhase, currentRound, config.exercises, config.rounds, config.roundBreakTime, isWorkoutComplete, showCountdown])

  // Swipe gesture handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      // Simulate right arrow key
      handleRightArrow()
    } else if (isRightSwipe) {
      // Simulate left arrow key
      handleLeftArrow()
    }
  }

  const formatTime = (seconds: number) => {
    // Only show seconds, no minutes
    return seconds.toString()
  }

  if (showCountdown) {
    return <CountdownScreen onComplete={startWorkout} />
  }

  const currentExercise = config.exercises[currentExerciseIndex]
  const backgroundColor = currentPhase === 'work' ? '#22c55e' :
                         currentPhase === 'rest' ? '#ef4444' : '#f59e0b'

  // Get upcoming exercise info
  const upcomingExercise = currentExerciseIndex < config.exercises.length - 1
    ? config.exercises[currentExerciseIndex + 1]
    : null

  return (
    <div
      className="timer-screen"
      style={{ backgroundColor }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
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
            Round {currentRound} of {config.rounds || 1}
            {currentPhase !== 'roundBreak' && ` • Exercise ${currentExerciseIndex + 1} of ${config.exercises.length}`}
          </div>

          {/* Upcoming exercise display */}
          {upcomingExercise && currentPhase !== 'roundBreak' && (
            <div className="upcoming-exercise">
              <div className="upcoming-label">
                {currentPhase === 'work' ? 'Next:' : 'Coming up:'}
              </div>
              <div className={`upcoming-name ${currentPhase === 'rest' ? 'current' : ''}`}>
                {upcomingExercise.name}
              </div>
            </div>
          )}

          {/* Round break info */}
          {currentPhase === 'roundBreak' && (
            <div className="upcoming-exercise">
              <div className="upcoming-label">Next Round:</div>
              <div className="upcoming-name current">
                Round {currentRound + 1}
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

        <div className="keyboard-hints mobile-hidden">
          <div>Space: {isWorkoutComplete ? 'Restart' : 'Pause/Resume'}</div>
          <div>← →: {isWorkoutComplete ? 'Restart' : 'Previous/Next Phase'}</div>
        </div>
      </div>
    </div>
  )
}
