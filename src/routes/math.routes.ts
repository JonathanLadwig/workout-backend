import Elysia, { t } from "elysia";
import { MathController } from "../controllers/math.controller";

export const mathRoutes = new Elysia({ prefix: "/math" })
    .get("", () => "Math endpoint")
    .get("/:prompt", ({ params }) => {
        return MathController.answerMathQuestion(params.prompt);
    })
    .post("/image/:prompt", ({ params, body }) => {
        const { image } = body as { image: File };
        return MathController.answerQuestionWithImage(params.prompt, image);
    }, {
        body: t.Object({
            image: t.File()
        })
    })
    // New streaming chat endpoints
    .post("/chat/:sessionId", async ({ params, body, ...ctx }) => {
        const { message } = body as { message: string };
        return MathController.streamChatWithMemory(params.sessionId, message, ctx);
    }, {
        body: t.Object({
            message: t.String()
        })
    })
    .get("/chat/:sessionId/history", ({ params }) => {
        return MathController.getChatHistory(params.sessionId);
    })
    .delete("/chat/:sessionId", ({ params }) => {
        return MathController.clearChatHistory(params.sessionId);
    });