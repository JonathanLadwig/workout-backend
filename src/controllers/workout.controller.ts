import { RAPID_API_KEY } from "../env/keys";
import { sanitizeWorkoutName } from "../functions/santizeWorkoutName";

export class WorkoutController {
    static async findWorkoutByName(name: string) {
        try {
            const sanitizedName = sanitizeWorkoutName(name);
            const encodedName = encodeURIComponent(sanitizedName);
            const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodedName}?offset=0&limit=1`;

            const response = await fetch(url, {
                method: 'GET',
                headers: new Headers({
                    'X-RapidAPI-Key': RAPID_API_KEY ?? '',
                    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching workout by name:', error);
            throw error;
        }
    }
}