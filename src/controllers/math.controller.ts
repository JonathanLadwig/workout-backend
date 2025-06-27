import ollama from 'ollama';

type Message = { role: "user" | "assistant" | "system"; content: string };

// Simple in-memory conversation store per session
const conversationMemory: Record<string, Message[]> = {};

export class MathController {
    static async answerMathQuestion(prompt: string) {
        try {
            const formattedPrompt = prompt.trim().replace(/%20/g, ' ') // Replace %20 with space
            console.log('Answering math question:', formattedPrompt)
            const response = await ollama.chat({
                model: 'qwen2.5vl:7b',
                messages: [{ role: 'user', content: formattedPrompt + '. Provide a detailed solution to the math problem.' }],
            })
            return response.message.content
        } catch (error) {
            console.error('Error answering math question:', error)
            return {
                success: false,
                message: 'Failed to answer math question'
            }
        }
    }

    static async answerQuestionWithImage(prompt: string, imageFile: File) {
        try {
            const formattedPrompt = prompt.trim().replace(/%20/g, ' ');
            console.log('Answering question with image:', formattedPrompt);

            // Convert File to base64 or handle as needed for ollama
            const imageBuffer = await imageFile.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');

            const response = await ollama.chat({
                model: 'qwen2.5vl:7b',
                messages: [
                    {
                        role: 'user',
                        content: formattedPrompt + '. Provide a detailed solution to the math problem.',
                        images: [base64Image]
                    }
                ],
            });
            return response.message.content;
        } catch (error) {
            console.error('Error answering question with image:', error);
            return {
                success: false,
                message: 'Failed to answer question with image'
            };
        }
    }

    static async streamChatWithMemory(sessionId: string, message: string, ctx: any) {
        try {
            if (!message) {
                return ctx.json({ error: "No message provided" }, 400);
            }

            // Load or init conversation memory
            if (!conversationMemory[sessionId]) {
                conversationMemory[sessionId] = [
                    { role: "system", content: "You are a helpful math tutor. Provide detailed solutions to math problems." },
                ];
            }

            // Keep only last 20 messages to prevent memory bloat
            if (conversationMemory[sessionId].length > 20) {
                conversationMemory[sessionId] = [
                    conversationMemory[sessionId][0], // Keep system message
                    ...conversationMemory[sessionId].slice(-19) // Keep last 19 messages
                ];
            }

            conversationMemory[sessionId].push({ role: "user", content: message });

            // Set up streaming response headers
            ctx.set.status = 200;
            ctx.set.headers = {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control"
            };

            let assistantReply = "";

            // Stream the response using ollama
            const stream = await ollama.chat({
                model: 'qwen2.5vl:7b',
                messages: conversationMemory[sessionId],
                stream: true,
            });

            // Create a custom response to handle streaming
            return new Response(
                new ReadableStream({
                    async start(controller) {
                        try {
                            for await (const chunk of stream) {
                                const content = chunk.message?.content || '';
                                if (content) {
                                    assistantReply += content;
                                    // Send as Server-Sent Event
                                    const data = `data: ${JSON.stringify({ content })}\n\n`;
                                    controller.enqueue(new TextEncoder().encode(data));
                                }
                            }

                            // Save complete response to memory
                            conversationMemory[sessionId].push({
                                role: "assistant",
                                content: assistantReply
                            });

                            // Send completion signal
                            const endData = `data: ${JSON.stringify({ done: true })}\n\n`;
                            controller.enqueue(new TextEncoder().encode(endData));
                            controller.close();
                        } catch (error) {
                            console.error('Streaming error:', error);
                            const errorData = `data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`;
                            controller.enqueue(new TextEncoder().encode(errorData));
                            controller.close();
                        }
                    }
                }),
                {
                    headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Cache-Control"
                    }
                }
            );

        } catch (error) {
            console.error('Error in streaming chat:', error);
            return ctx.json({
                success: false,
                message: 'Failed to process streaming chat'
            }, 500);
        }
    }

    static async getChatHistory(sessionId: string) {
        try {
            return {
                success: true,
                messages: conversationMemory[sessionId] || []
            };
        } catch (error) {
            console.error('Error getting chat history:', error);
            return {
                success: false,
                message: 'Failed to get chat history'
            };
        }
    }

    static async clearChatHistory(sessionId: string) {
        try {
            delete conversationMemory[sessionId];
            return {
                success: true,
                message: 'Chat history cleared'
            };
        } catch (error) {
            console.error('Error clearing chat history:', error);
            return {
                success: false,
                message: 'Failed to clear chat history'
            };
        }
    }
}