import { Elysia } from "elysia";

interface ErrorResponse {
    success: false;
    message: string;
    error: string;
}

export const errorHandler = new Elysia()
    .onError(({ code, error, set }): ErrorResponse => {
        console.error('Error occurred:', error);

        let errorMessage: string;
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
            errorMessage = JSON.stringify(error);
        } else {
            errorMessage = String(error);
        }

        switch (code) {
            case 'VALIDATION':
                set.status = 400;
                return {
                    success: false,
                    message: 'Validation error',
                    error: errorMessage
                };

            case 'NOT_FOUND':
                set.status = 404;
                return {
                    success: false,
                    message: 'Resource not found',
                    error: errorMessage
                };

            case 'PARSE':
                set.status = 400;
                return {
                    success: false,
                    message: 'Invalid request format',
                    error: errorMessage
                };

            case 'INTERNAL_SERVER_ERROR':
                set.status = 500;
                return {
                    success: false,
                    message: 'Internal server error',
                    error: process.env.NODE_ENV === 'production'
                        ? 'An unexpected error occurred'
                        : errorMessage
                };

            default:
                set.status = 500;
                return {
                    success: false,
                    message: 'An error occurred',
                    error: errorMessage
                };
        }
    });