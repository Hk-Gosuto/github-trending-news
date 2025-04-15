import 'dotenv/config';
import type { LanguageModelV1 } from 'ai'
import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createXai } from '@ai-sdk/xai'

const modelName = process.env.MODEL_NAME!;
const provider = process.env.AI_PROVIDER ?? "openai";
const apiKey = process.env.AI_API_KEY!;
const baseURL = process.env.AI_BASE_URL?.trim() ? process.env.AI_BASE_URL : undefined;

type AIProviderFactory = (options: { apiKey: string; baseURL?: string }) => (modelName: string) => LanguageModelV1;

const AI_PROVIDER_FACTORIES: Record<string, AIProviderFactory> = {
    anthropic: ({ apiKey, baseURL }) => (modelName) => createAnthropic({ apiKey, baseURL })(modelName),
    deepseek: ({ apiKey, baseURL }) => (modelName) => createDeepSeek({ apiKey, baseURL })(modelName),
    groq: ({ apiKey, baseURL }) => (modelName) => createGroq({ apiKey, baseURL })(modelName),
    google: ({ apiKey, baseURL }) => (modelName) => createGoogleGenerativeAI({ apiKey, baseURL })(modelName),
    xai: ({ apiKey, baseURL }) => (modelName) => createXai({ apiKey, baseURL })(modelName),
    openai: ({ apiKey, baseURL }) => (modelName) => {
        if (!baseURL)
            return createOpenAI({ apiKey })(modelName)
        else
            return createOpenAICompatible({
                name: 'openai',
                baseURL,
                headers: { Authorization: `Bearer ${apiKey}` },
            })(modelName);
    },
};

export class Translator {
    // private axiosInstance;

    constructor() {
        // this.axiosInstance = axios.create({
        //     headers: {
        //         'Authorization': `Bearer ${apiKey}`,
        //         'Content-Type': 'application/json'
        //     }
        // });
    }

    private getProvider() {
        const providerFactory = AI_PROVIDER_FACTORIES[provider];
        if (!providerFactory) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        const modelFactory = providerFactory({ apiKey: apiKey, baseURL: baseURL });
        return modelFactory(modelName);
    }

    async translate(text: string, sourceLanguage: string | undefined = undefined, targetLanguage: string = '简体中文'): Promise<string> {
        try {
            const prompt = this.constructPrompt(text, sourceLanguage, targetLanguage);
            const aiProvider = this.getProvider();
            if (!aiProvider)
                throw new Error('ai provider not found')
            const { text: translation, usage, finishReason } = await generateText({
                model: aiProvider,
                prompt: prompt,
            })
            return translation.trim() || '';
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    }

    private constructPrompt(text: string, sourceLanguage: string | undefined, targetLanguage: string): string {
        let prompt = `You are a professional translator.\n\nUrl does not require translation.\n\nOnly reply the result and nothing else. Please translate to ${targetLanguage}:\n\n`;
        prompt += `"${text}"`;
        return prompt;
    }
}

export interface ITranslateResult {
    translation: string;
    detectedSourceLanguage?: string;
}