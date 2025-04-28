/**
 * Sanitizes a workout name by converting to lowercase and removing plural forms.
 * @param name The workout name to sanitize
 * @returns The sanitized workout name
 */
export function sanitizeWorkoutName(name: string): string {
    if (!name) {
        return '';
    }

    // Convert to lowercase
    let sanitized = name.toLowerCase().trim();

    // Remove plural forms (simple 's' ending)
    if (sanitized.endsWith('s')) {
        // Don't remove 's' if it's part of a word that's naturally plural
        const exceptions = ['abs', 'biceps', 'triceps', 'deltoids', 'quads', 'glutes', 'hamstrings'];

        if (!exceptions.includes(sanitized)) {
            sanitized = sanitized.slice(0, -1);
        }
    }

    // Handle special cases of irregular plural forms
    const irregularPlurals: Record<string, string> = {
        'lunges': 'lunge',
        'pushes': 'push',
        'presses': 'press',
        'benches': 'bench',
        'crunches': 'crunch',
        'raises': 'raise',
        'curls': 'curl',
        'extensions': 'extension',
        'flies': 'fly',
    };

    return irregularPlurals[sanitized] || sanitized;
}