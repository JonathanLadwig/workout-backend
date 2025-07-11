import { UserProfile } from '../models/user.model';

export class UserService {
    // In-memory storage for demo purposes - replace with database in production
    private static readonly users: Map<string, UserProfile> = new Map();

    static async getUserProfile(userId: string): Promise<UserProfile | null> {
        return this.users.get(userId) || null;
    }

    static async createUserProfile(profile: UserProfile): Promise<void> {
        this.users.set(profile.userId, profile);
    }

    static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
        const existingProfile = this.users.get(userId);
        if (existingProfile) {
            this.users.set(userId, { ...existingProfile, ...updates });
        }
    }

    static async getAllUsers(): Promise<UserProfile[]> {
        return Array.from(this.users.values());
    }

    // Helper method to get user's fitness level
    static async getUserFitnessLevel(userId: string): Promise<string> {
        const profile = await this.getUserProfile(userId);
        return profile?.fitnessLevel || 'beginner';
    }

    // Helper method to get user's available equipment
    static async getUserEquipment(userId: string): Promise<string[]> {
        const profile = await this.getUserProfile(userId);
        return profile?.availableEquipment || ['body weight'];
    }
}
