import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { routes } from "./routes/routes";

const app = new Elysia()
.use(cors())
.use(swagger({
  documentation: {
    info: {
      title: "Workout API",
      version: "1.0.0"
    }
  }
}))
.use(routes)
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
