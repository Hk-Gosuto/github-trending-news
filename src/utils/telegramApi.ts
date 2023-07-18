import axios from 'axios';

const telegramToken = process.env.TELEGRAM_TOKEN!;
const telegramChannelId = process.env.TELEGRAM_CHANNEL_ID!;

export async function sendMessage(text: string) {
    const url = `https://api.telegram.org/bot${telegramToken}/` + 'sendMessage';
    const data = { chat_id: telegramChannelId, text, parse_mode: 'Markdown', disable_web_page_preview: true };
    const response = await axios.post(url, data);
    return response.data;
}