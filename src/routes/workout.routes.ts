import Elysia from "elysia";
import { WorkoutController } from "../controllers/workout.controller";

export const workoutRoutes = new Elysia({ prefix: "/workout" })
    .get("/", () => "Workout endpoint")
    .get("/:name", ({ params }) => {
        return WorkoutController.findWorkoutByName(params.name);
    })