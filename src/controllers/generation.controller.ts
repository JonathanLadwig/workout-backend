import ollama from 'ollama'
import { WorkoutRequest } from '../models/user.model'
import { UserService } from '../services/user.service'

export class GenerationController {
    static async generateWorkout(prompt: string) {
        try {
            const response = await ollama.chat({
                model: 'mistral',
                messages: [{ role: 'user', content: prompt + '. Give only an array of workouts, that include a name: and either duration: (in seconds) OR the number of reps: and sets: Return JSON' }],
            })
            return response.message.content
        } catch (error) {
            console.error('Error generating workout:', error)
            return {
                success: false,
                message: 'Failed to generate workout'
            }
        }
    }

    static async generateSmartWorkout(workoutRequest: WorkoutRequest) {
        try {
            // Get user profile if userId is provided
            let userProfile = null;
            if (workoutRequest.userId) {
                userProfile = await UserService.getUserProfile(workoutRequest.userId);
            }

            // Build context-aware prompt
            const contextualPrompt = this.buildContextualPrompt(workoutRequest, userProfile);

            const response = await ollama.chat({
                model: 'mistral',
                messages: [{
                    role: 'user',
                    content: contextualPrompt
                }],
            });

            // Parse the JSON response from the AI
            const workoutData = this.parseWorkoutResponse(response.message.content);

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

    private static parseWorkoutResponse(responseContent: string): any[] {
        try {
            // Clean the response to extract JSON
            let jsonString = responseContent.trim();

            // Remove any markdown code block markers
            jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            // Find JSON array in the response
            const jsonStart = jsonString.indexOf('[');
            const jsonEnd = jsonString.lastIndexOf(']') + 1;

            if (jsonStart !== -1 && jsonEnd > jsonStart) {
                jsonString = jsonString.substring(jsonStart, jsonEnd);
            }

            // Parse the JSON
            const workoutArray = JSON.parse(jsonString);

            // Validate it's an array
            if (!Array.isArray(workoutArray)) {
                throw new Error('Response is not an array');
            }

            return workoutArray;
        } catch (error) {
            console.error('Failed to parse workout JSON:', error);
            console.error('Raw response:', responseContent);

            // Return a fallback workout if parsing fails
            return this.getFallbackWorkout();
        }
    }

    private static getFallbackWorkout(): any[] {
        return [
            {
                "name": "Push-ups",
                "type": "strength",
                "targetMuscles": ["chest", "triceps"],
                "equipment": "body weight",
                "instructions": [
                    "Start in a plank position with hands slightly wider than shoulders",
                    "Lower your chest towards the floor",
                    "Push back up to starting position"
                ],
                "sets": 3,
                "reps": 10,
                "restPeriod": 60,
                "difficulty": "beginner"
            },
            {
                "name": "Bodyweight Squats",
                "type": "strength",
                "targetMuscles": ["legs", "glutes"],
                "equipment": "body weight",
                "instructions": [
                    "Stand with feet shoulder-width apart",
                    "Lower down as if sitting in a chair",
                    "Return to standing position"
                ],
                "sets": 3,
                "reps": 15,
                "restPeriod": 60,
                "difficulty": "beginner"
            },
            {
                "name": "Plank",
                "type": "strength",
                "targetMuscles": ["core"],
                "equipment": "body weight",
                "instructions": [
                    "Start in push-up position",
                    "Hold body in straight line",
                    "Engage core muscles"
                ],
                "duration": 30,
                "restPeriod": 60,
                "difficulty": "beginner"
            }
        ];
    }

    private static buildContextualPrompt(request: WorkoutRequest, userProfile: any): string {
        const fitnessLevel = request.fitnessLevel || userProfile?.fitnessLevel || 'beginner';
        const duration = request.duration || userProfile?.workoutDuration || 30;
        const equipment = request.equipment || userProfile?.availableEquipment || ['body weight'];
        const intensity = request.intensity || 'medium';

        let prompt = `Generate a ${request.workoutType} workout for a ${fitnessLevel} fitness level person.

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
Return the workout as a JSON array with this exact structure:
[
  {
    "name": "Exercise Name",
    "type": "strength|cardio|flexibility",
    "targetMuscles": ["muscle1", "muscle2"],
    "equipment": "required equipment",
    "instructions": ["step 1", "step 2", "step 3"],
    "sets": number (for strength exercises),
    "reps": number (for strength exercises),
    "duration": number in seconds (for cardio/flexibility),
    "restPeriod": number in seconds,
    "difficulty": "beginner|intermediate|advanced"
  }
]

Make sure the workout is appropriate for the ${fitnessLevel} level and uses only the available equipment: ${equipment.join(', ')}.`;

        return prompt;
    }
}