import axios from 'axios';
import 'dotenv/config';

const model = process.env.GLM_MODEL!;
const apiKey = process.env.GLM_API_KEY!;
const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export class Translator {
    private axiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async translate(text: string, sourceLanguage: string | undefined = undefined, targetLanguage: string = '简体中文'): Promise<string> {
        try {
            const prompt = this.constructPrompt(text, sourceLanguage, targetLanguage);
            const response = await this.axiosInstance.post(apiUrl, {
                model: model,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });

            const translation = response.data.choices[0].message.content?.trim();
            return translation || '';
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