// Response interface for smart workout generation
export interface SmartWorkoutResponse {
    success: boolean; // Indicates if the request was successful
    workout?: Workout[]; // The generated workout data
    context?: {
        fitnessLevel: string;
        workoutType: string;
        muscleGroups: string[];
        duration: number;
    };
    message?: string,
    error?: string
}
export interface Exercise {
    id: string                  // Unique exercise identifier
    name: string                // Exercise name (e.g., "clock push-up")
    bodyPart: string            // Main body part targeted (e.g., "chest")
    equipment: string           // Equipment required (e.g., "body weight")
    gifUrl: string              // URL to a demonstration GIF
    target: string              // Primary muscle targeted (e.g., "pectorals")
    secondaryMuscles: string[]  // Other muscles worked
    instructions: string[]      // Step-by-step instructions
    description: string         // Brief description of the exercise
    difficulty: string          // Difficulty level (e.g., "advanced")
    category: string            // Exercise category (e.g., "strength")
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