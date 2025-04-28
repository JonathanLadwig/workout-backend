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