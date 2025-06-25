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
