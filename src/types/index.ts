export interface Exercise {
  id: string
  name: string
  workTime: number
  restTime: number
}

export interface WorkoutConfig {
  exercises: Exercise[]
  rounds: number
  roundBreakTime: number
}

export interface SavedWorkout {
  id: string
  name: string
  config: WorkoutConfig
  createdAt: number
  updatedAt: number
}
