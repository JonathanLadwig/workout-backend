import Elysia from "elysia";
import { generatorRoutes } from "./generator.routes";
import { workoutRoutes } from "./workout.routes";

export const routes = new Elysia()
    .use(generatorRoutes)
    .use(workoutRoutes)