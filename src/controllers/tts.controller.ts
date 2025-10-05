import axios from 'axios';
import { Elysia } from 'elysia';

export const ttsController = new Elysia().post('/tts', async ({ body, set }) => {

    /*
    Kokoro-82M supported voices:
    - af_heart
    - af_nicole
    - bm_fable
    - bm_lewis
    - bm_george
    */

    const { text, voice = 'af_heart', model = 'tts-1', response_format = 'mp3' } = body as {
        text: string;
        voice?: string;
        model?: string;
        response_format?: string;
        rate?: string;
    };

    if (!text || typeof text !== 'string') {
        set.status = 400;
        return { error: 'Missing or invalid text input.' };
    }

    try {
        // OpenAI-compatible request
        const response = await axios.post(
            'http://192.168.0.3:8880/v1/audio/speech',
            {
                model,
                input: text,
                voice,
                response_format
            },
            { responseType: 'arraybuffer' }
        );

        set.headers['Content-Type'] = 'audio/mpeg';
        set.headers['Content-Disposition'] = 'inline; filename="tts.mp3"';
        return new Uint8Array(response.data);
    } catch (err) {
        set.status = 500;
        return { error: 'TTS service failed.' };
    }
});