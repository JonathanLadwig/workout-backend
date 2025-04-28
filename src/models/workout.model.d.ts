export interface Exercise {
    bodyPart: string
    equipment: string
    gifUrl: string
    id: string
    name: string
    target: string
    secondaryMuscles: string[]
    instructions: string[]
}

export interface Workout {
    exercise: Exercise
    isDuration: boolean // true if the exercise is a duration-based exercise
    quantity: number // number of sets or reps or duration in seconds
}

export interface WorkoutPlan {
    name: string
    description: string
    days: string[]
    time: string
    workouts: Workout[]
}