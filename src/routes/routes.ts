import Elysia from "elysia";
import { errorHandler } from "../middleware/error.handler";
import { generatorRoutes } from "./generator.routes";
import ttsRoutes from "./tts.routes";
import { userRoutes } from "./user.routes";
import { workoutRoutes } from "./workout.routes";

export const routes = new Elysia()
    .use(errorHandler)
    .use(generatorRoutes)
    .use(workoutRoutes)
    .use(userRoutes)
    .use(ttsRoutes)