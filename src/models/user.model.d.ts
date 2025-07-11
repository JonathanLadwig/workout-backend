export interface UserProfile {
    userId: string
    name: string
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
    age?: number
    goals: string[]
    preferredMuscleGroups?: string[]
    availableEquipment: string[]
    workoutDuration?: number // preferred duration in minutes
}

export interface WorkoutRequest {
    userId?: string
    workoutType: 'strength' | 'cardio' | 'flexibility' | 'mixed'
    muscleGroups: string[]
    duration?: number
    intensity?: 'low' | 'medium' | 'high'
    equipment?: string[]
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced'
}
