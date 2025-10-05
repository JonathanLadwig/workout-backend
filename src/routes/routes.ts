import Elysia from "elysia";
import { generatorRoutes } from "./generator.routes";
import ttsRoutes from "./tts.routes";
import { userRoutes } from "./user.routes";
import { workoutRoutes } from "./workout.routes";

export const routes = new Elysia()
    .use(generatorRoutes)
    .use(workoutRoutes)
    .use(userRoutes)
    .use(ttsRoutes)