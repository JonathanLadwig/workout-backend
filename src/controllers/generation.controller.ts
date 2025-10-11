import { Ollama } from 'ollama';
import { WorkoutRequest } from '../models/user.model';
import { SmartWorkoutResponse } from '../models/workout.model';
import { UserService } from '../services/user.service';

export class GenerationController {
    static async generateWorkout(prompt: string) {
        try {
            const ollamaClient = new Ollama({ host: 'http://192.168.0.3:11434' });
            const response = await ollamaClient.chat({
                model: 'mistral-nemo:latest',
                messages: [{ role: 'user', content: prompt + '. Give only an array of workouts, that include a name: and either duration: (in seconds) OR the number of reps: and sets: Return JSON' }],
            });
            return response.message.content;
        } catch (error) {
            console.error('Error generating workout:', error);
            return {
                success: false,
                message: 'Failed to generate workout'
            };
        }
    }

    static async generateSmartWorkout(workoutRequest: WorkoutRequest): Promise<SmartWorkoutResponse> {
        try {
            let userProfile = null;
            if (workoutRequest.userId) {
                userProfile = await UserService.getUserProfile(workoutRequest.userId);
            }

            console.log('Starting workout generation with request');

            const contextualPrompt = this.buildContextualPrompt(workoutRequest, userProfile);

            console.log('Contextual Prompt:');
            console.log(contextualPrompt);

            const ollamaClient = new Ollama({ host: 'http://192.168.0.3:11434' });

            // Define JSON schema for structured output
            const workoutSchema = {
                type: "array",
                items: {
                    type: "object",
                    required: ["name", "type", "targetMuscles", "equipment", "instructions", "restPeriod", "difficulty"],
                    properties: {
                        name: { type: "string" },
                        type: { type: "string", enum: ["strength", "cardio", "flexibility"] },
                        targetMuscles: { type: "array", items: { type: "string" } },
                        equipment: { type: "string" },
                        instructions: { type: "array", items: { type: "string" } },
                        sets: { type: "number" },
                        reps: { type: "number" },
                        duration: { type: "number" },
                        restPeriod: { type: "number" },
                        difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] }
                    }
                }
            };

            const response = await ollamaClient.chat({
                model: 'mistral-nemo:latest',
                messages: [{
                    role: 'user',
                    content: contextualPrompt
                }],
                format: workoutSchema, // Pass schema instead of just 'json'
                options: {
                    temperature: 0.3,
                }
            });

            console.log('Raw response from Ollama:');
            console.log(response.message.content);

            const workoutData = JSON.parse(response.message.content);

            return {
                success: true,
                workout: workoutData,
                context: {
                    fitnessLevel: workoutRequest.fitnessLevel || userProfile?.fitnessLevel || 'beginner',
                    workoutType: workoutRequest.workoutType,
                    muscleGroups: workoutRequest.muscleGroups,
                    duration: workoutRequest.duration || userProfile?.workoutDuration || 30
                }
            };
        } catch (error) {
            console.error('Error generating smart workout:', error);
            return {
                success: false,
                message: 'Failed to generate smart workout',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    private static buildContextualPrompt(request: WorkoutRequest, userProfile: any): string {
        const fitnessLevel = request.fitnessLevel || userProfile?.fitnessLevel || 'beginner';
        const duration = request.duration || userProfile?.workoutDuration || 30;
        const equipment = request.equipment || userProfile?.availableEquipment || ['body weight'];
        const intensity = request.intensity || 'medium';

        let prompt = `You are a fitness expert. Generate a ${request.workoutType} workout for a ${fitnessLevel} fitness level person.

Workout Requirements:
- Target muscle groups: ${request.muscleGroups.join(', ')}
- Duration: approximately ${duration} minutes
- Intensity: ${intensity}
- Available equipment: ${equipment.join(', ')}
- Fitness level: ${fitnessLevel}

`;

        // Add fitness level specific instructions
        if (fitnessLevel === 'beginner') {
            prompt += `
Beginner Guidelines:
- Focus on proper form and basic movements
- Lower intensity and fewer reps
- Include rest periods between exercises
- Avoid complex compound movements
- Start with bodyweight or light weights
`;
        } else if (fitnessLevel === 'intermediate') {
            prompt += `
Intermediate Guidelines:
- Include compound movements
- Moderate to high intensity
- Mix of strength and endurance exercises
- Can handle moderate weights
- Include some advanced variations
`;
        } else if (fitnessLevel === 'advanced') {
            prompt += `
Advanced Guidelines:
- Complex compound movements
- High intensity training
- Advanced exercise variations
- Heavy weights or challenging progressions
- Minimal rest periods
- Include plyometric or explosive movements
`;
        }

        // Add workout type specific instructions
        if (request.workoutType === 'strength') {
            prompt += `
Strength Focus:
- Emphasize resistance exercises
- Include compound movements like squats, deadlifts, presses
- Focus on muscle building and strength gains
- Sets and reps format (e.g., 3 sets of 8-12 reps)
`;
        } else if (request.workoutType === 'cardio') {
            prompt += `
Cardio Focus:
- Heart rate elevating exercises
- Include HIIT or steady-state cardio options
- Time-based exercises (duration in seconds)
- Full body movement patterns
`;
        } else if (request.workoutType === 'flexibility') {
            prompt += `
Flexibility Focus:
- Stretching and mobility exercises
- Hold times for stretches (duration in seconds)
- Target major muscle groups and joints
- Include dynamic and static stretches
`;
        } else if (request.workoutType === 'mixed') {
            prompt += `
Mixed Workout:
- Combine strength, cardio, and flexibility elements
- Varied exercise types
- Balance between muscle groups
- Include warm-up and cool-down
`;
        }

        prompt += `

Rules:
- For strength exercises: include "sets" and "reps" as numbers
- For cardio/flexibility exercises: include "duration" as number in seconds
- Always include "restPeriod" as number in seconds
- "instructions" must be an array of strings (at least 2-3 steps)
- "targetMuscles" must be an array of strings
- Return ONLY the JSON array, nothing else

Make sure the workout is appropriate for ${fitnessLevel} level using: ${equipment.join(', ')}.`;

        return prompt;
    }
}