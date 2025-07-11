import Elysia from "elysia";
import { UserService } from "../services/user.service";

export const userRoutes = new Elysia({ prefix: "/users" })
    .get("", async () => {
        const users = await UserService.getAllUsers();
        return { success: true, users };
    })

    .get("/:userId", async ({ params }) => {
        const profile = await UserService.getUserProfile(params.userId);
        if (!profile) {
            return { success: false, message: "User not found" };
        }
        return { success: true, profile };
    })

    .post("", async ({ body }: {
        body: {
            userId: string,
            name: string,
            fitnessLevel: 'beginner' | 'intermediate' | 'advanced',
            age?: number,
            goals: string[],
            preferredMuscleGroups?: string[],
            availableEquipment: string[],
            workoutDuration?: number
        }
    }) => {
        await UserService.createUserProfile(body);
        return { success: true, message: "User profile created" };
    })

    .put("/:userId", async ({ params, body }: {
        params: { userId: string },
        body: any
    }) => {
        await UserService.updateUserProfile(params.userId, body);
        return { success: true, message: "User profile updated" };
    })

    // Quick setup endpoints for common user types
    .post("/:userId/quick-setup/:type", async ({ params }) => {
        const { userId, type } = params;

        const presets: { [key: string]: any } = {
            beginner: {
                userId,
                name: `User ${userId}`,
                fitnessLevel: 'beginner',
                goals: ['general fitness', 'weight loss'],
                availableEquipment: ['body weight'],
                workoutDuration: 20
            },
            intermediate: {
                userId,
                name: `User ${userId}`,
                fitnessLevel: 'intermediate',
                goals: ['muscle gain', 'strength'],
                availableEquipment: ['body weight', 'dumbbells', 'resistance bands'],
                workoutDuration: 45
            },
            advanced: {
                userId,
                name: `User ${userId}`,
                fitnessLevel: 'advanced',
                goals: ['strength', 'muscle gain', 'athletic performance'],
                availableEquipment: ['body weight', 'dumbbells', 'barbell', 'resistance bands', 'kettlebells'],
                workoutDuration: 60
            }
        };

        const preset = presets[type];
        if (!preset) {
            return { success: false, message: "Invalid preset type" };
        }

        await UserService.createUserProfile(preset);
        return { success: true, message: `${type} profile created`, profile: preset };
    });
