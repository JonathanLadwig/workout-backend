# Smart Workout Generator - API Examples

The workout backend now supports smart workout generation based on user context! Here are the available endpoints:

## User Management

### Create a User Profile

```bash
# Quick setup for a beginner
curl -X POST http://localhost:3000/users/user123/quick-setup/beginner

# Quick setup for intermediate
curl -X POST http://localhost:3000/users/user456/quick-setup/intermediate

# Quick setup for advanced
curl -X POST http://localhost:3000/users/user789/quick-setup/advanced
```

### Custom User Profile

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "custom123",
    "name": "John Doe",
    "fitnessLevel": "intermediate",
    "age": 30,
    "goals": ["muscle gain", "strength"],
    "availableEquipment": ["dumbbells", "resistance bands", "body weight"],
    "workoutDuration": 45
  }'
```

## Smart Workout Generation

### Generate Context-Aware Workout

```bash
curl -X POST http://localhost:3000/generate/smart-workout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "workoutType": "strength",
    "muscleGroups": ["chest", "triceps"],
    "duration": 30,
    "intensity": "medium"
  }'
```

### Quick Workout Generation

```bash
# Upper body strength workout for beginners
curl http://localhost:3000/generate/quick/strength/beginner

# Full body cardio for intermediate
curl http://localhost:3000/generate/quick/cardio/intermediate

# Core workout for advanced
curl http://localhost:3000/generate/quick/core/advanced
```

## Workout Types Available

- `strength` - Resistance training focused
- `cardio` - Heart rate elevating exercises
- `flexibility` - Stretching and mobility
- `mixed` - Combination of all types

## Muscle Groups

- `upper` - Chest, back, shoulders, arms
- `lower` - Legs, glutes, calves
- `core` - Abs, obliques, lower back
- `full` - Full body workout

## Fitness Levels

- `beginner` - Basic movements, lower intensity
- `intermediate` - Moderate complexity and intensity
- `advanced` - Complex movements, high intensity

## Equipment Options

- `body weight` - No equipment needed
- `dumbbells` - Adjustable dumbbells
- `resistance bands` - Elastic bands
- `barbell` - Olympic barbell
- `kettlebells` - Kettlebell training

## Example Response

The smart workout generator returns detailed exercise information:

```json
{
  "success": true,
  "workout": [
    {
      "name": "Push-ups",
      "type": "strength",
      "targetMuscles": ["chest", "triceps"],
      "equipment": "body weight",
      "instructions": [
        "Start in plank position",
        "Lower chest to floor",
        "Push back up"
      ],
      "sets": 3,
      "reps": 12,
      "restPeriod": 60,
      "difficulty": "beginner"
    }
  ],
  "context": {
    "fitnessLevel": "beginner",
    "workoutType": "strength",
    "muscleGroups": ["chest", "triceps"],
    "duration": 30
  }
}
```

## Home Assistant Integration Ready

This API is designed to work seamlessly with Home Assistant! You can:

- Create voice commands to generate workouts
- Track user fitness progress
- Get personalized workout recommendations
- Integrate with fitness trackers and smart home devices

Try it out and let me know if you'd like to add more features!
