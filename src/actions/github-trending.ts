import axios from 'axios';
import * as cheerio from 'cheerio';

const telegramToken = process.env.TELEGRAM_TOKEN!;
const telegramChannelId = process.env.TELEGRAM_CHANNEL_ID!;

const fetchData = async () => {
    const list: { title: string | undefined, href: string | undefined; description: string }[] = [];
    try {
        console.log('start fetching list');
        let res = await axios.get('https://github.com/trending');
        if (res.data) {
            const $ = await cheerio.load(res.data);
            const $repoList = $('.Box .Box-row');
            $repoList.each((a, b) => {
                const repoTitleA = $(b).find('>h2>a');
                const repoTitle = repoTitleA.text().replace(/\n/g, '').replace(/ /g, '').trim();
                const repoHref = repoTitleA.attr('href');
                const repoDesc = $(b).find('>p').text().replace(/\n/g, '').trim();
                list.push({
                    title: repoTitle,
                    href: `https://github.com${repoHref}`,
                    description: repoDesc
                });
            });
        } else {
            console.warn('get html error');
        }
    } catch (e) {
        console.warn(e);
    }
    return list;
};

const sendMessage = async (text: string) => {
    const url = `https://api.telegram.org/bot${telegramToken}/` + 'sendMessage';
    const data = { chat_id: telegramChannelId, text, parse_mode: 'markdown' };
    const response = await axios.post(url, data);
    return response.data;
}

const run = async (date: Date) => {
    console.log(date);
    let res = await fetchData();
    console.log(res);
    let title = date.toISOString().substring(0, 10) + ' Github Trending';
    let body = `${title}\n\n`;
    for (let item of res) {
        body += `[${item.title}](${item.href})\n\n`;
        body += `${item.description}\n\n`;
    }
    await sendMessage(body).then(console.log).catch(console.error);
};

run(new Date()).catch((err) => {
    throw err;
});