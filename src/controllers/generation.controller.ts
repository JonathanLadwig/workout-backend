import ollama from 'ollama'

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
}