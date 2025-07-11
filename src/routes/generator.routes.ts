import Elysia from "elysia";
import { GenerationController } from "../controllers/generation.controller";

export const generatorRoutes = new Elysia({ prefix: "/generate" })
  .get("", () => "Generation endpoint")
  .get("/workout", () => {
    return GenerationController.generateWorkout("Generate a workout for me");
  })
  .get("/workout/:prompt", ({ params }) => {
    return GenerationController.generateWorkout(params.prompt);
  })
  // New smart workout generation endpoint
  .post("/smart-workout", async ({ body }: {
    body: {
      userId?: string,
      workoutType: 'strength' | 'cardio' | 'flexibility' | 'mixed',
      muscleGroups: string[],
      duration?: number,
      intensity?: 'low' | 'medium' | 'high',
      equipment?: string[],
      fitnessLevel?: 'beginner' | 'intermediate' | 'advanced'
    }
  }) => {
    return await GenerationController.generateSmartWorkout(body);
  })
  // Quick workout generators for specific types
  .get("/quick/:type/:level", async ({ params }) => {
    const { type, level } = params;

    const muscleGroupMap: { [key: string]: string[] } = {
      'upper': ['chest', 'back', 'shoulders', 'arms'],
      'lower': ['legs', 'glutes', 'calves'],
      'core': ['abs', 'obliques', 'lower back'],
      'full': ['chest', 'back', 'legs', 'shoulders', 'arms']
    };

    const workoutRequest = {
      workoutType: type as 'strength' | 'cardio' | 'flexibility' | 'mixed',
      muscleGroups: muscleGroupMap[type] || ['full body'],
      fitnessLevel: level as 'beginner' | 'intermediate' | 'advanced',
      duration: 30,
      intensity: 'medium' as const,
      equipment: ['body weight']
    };

    return await GenerationController.generateSmartWorkout(workoutRequest);
  })