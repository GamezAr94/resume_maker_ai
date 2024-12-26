import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
    SchemaType,
} from '@google/generative-ai';

import { Entry } from '@/utils/interfaces';

// Function to analyse the user entry using Gemini API
/*
 * param     string  the prompt to be requested to gemini
 *
 * return    array   boolean false if error true if success, and the message or content
 */
export async function getGeminiResumeResponse(
    mainEntry: Entry,
): Promise<[boolean, string]> {
    const apiKey = process.env.GEMINI_API_KEY;

    // validate the API
    if (!apiKey) {
        return [false, 'no api key provided'];
    }
    // prepare the gemini tool
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        //model: "gemini-2.0-flash-exp",
        model: 'gemini-1.5-flash',
        // TODO ART: I think we need to change the model
        systemInstruction: `HERE GOES THE DESCRIPTION OF THE MODEL`,
    });

    // with this configuration you can configure the responses of gemini
    const generationConfig = {
        temperature: 0.6, //  creativity and randomness of the generated text, the higher the random it gets
        maxOutputTokens: 1000,
        topP: 0.8,
        topK: 30,
        responseMimeType: 'application/json',
        responseSchema: {
            // TODO ART: use the gemini studio to get the schema
        },
    };

    try {
        const chatSession = model.startChat({
            generationConfig,
            history: [], // TODO ART: I am not sure what is this but I feel we are going to need it
        });

        // We send the user entry and we store the response
        const result = await chatSession.sendMessage(mainEntry.content);

        return [true, result.response.text()];
    } catch (error) {
        return [false, `Error during generation: ${error}`];
    }
}
