import axios from 'axios';
import * as cheerio from 'cheerio';
import { sendMessage } from '../utils/telegramApi';
import { Translator } from '../utils/llmTranslate';

const fetchData = async () => {
    const list: {
        title: string | undefined,
        href: string | undefined,
        language: string | undefined,
        star: string | undefined,
        fork: string | undefined,
        description: string
    }[] = [];
    try {
        console.log('start fetching list');
        let res = await axios.get('https://github.com/trending');
        if (res.data) {
            const $ = cheerio.load(res.data);
            const $repoList = $('.Box .Box-row');
            $repoList.each((a, b) => {
                const repoTitleA = $(b).find('>h2>a');
                const repoTitle = repoTitleA.text().replace(/\n/g, '').replace(/ /g, '').replace(/[^\u0000-\u007F]/g, '').trim();
                const repoHref = repoTitleA.attr('href');
                const repoLanguageSpan = $(b).find('>div').last().find('>span>span').last();
                const repoLanguage = repoLanguageSpan.text().trim();
                const repoStar = $(b).find('>div').last().find('>a').first().text().trim();
                const repoFork = $(b).find('>div').last().find('>a').last().text().trim();

                const repoDesc = $(b).find('>p').text().replace(/\n/g, '').replace(/\"/g, "'").replace(/[^\u0000-\u007F]/g, '').trim();
                list.push({
                    title: markdownFormat(repoTitle),
                    href: `https://github.com${repoHref}`,
                    description: markdownFormat(repoDesc),
                    language: markdownFormat(repoLanguage),
                    star: repoStar,
                    fork: repoFork
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

const run = async (date: Date) => {
    console.log(date);
    let res = await fetchData();
    console.log(res);
    const maxCharacters = 4096;
    let title = date.toISOString().substring(0, 10) + ' Github Trending';
    let partIndex = 1;
    let body = `${title} Part ${partIndex}\n`;
    for (let item of res) {
        let tempBody = '';
        tempBody += `[${item.title}](${item.href})\n`;
        tempBody += `💻: ${item.language} 🌟: ${item.star} 🔀: ${item.fork}\n`;
        if (item.description) {
            tempBody += `💬: ${item.description}\n`;
            const translator = new Translator();
            let descriptionCN = await translator.translate(item.description);
            tempBody += `🇨🇳: ${descriptionCN}\n`;
        }
        tempBody += '\n';
        if (stringLength(body + tempBody) > (maxCharacters - 500)) {
            await sendMessage(body).then(console.log).catch(console.error);
            body = `${title} Part ${++partIndex}\n`;
        }
        body += tempBody;
    }
    await sendMessage(body).then(console.log).catch(console.error);
};

const stringLength = (str: string): number => {
    let length = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        if (/[\u4e00-\u9fa5]/.test(char)) {
            length += 2;
        } else {
            length += 1;
        }
    }
    return length;
}

run(new Date()).catch((err) => {
    throw err;
});

const markdownFormat = (str: string): string => {
    return str.replace(/\*/g, '\\*')
        .replace(/\~/g, '\\~')
        .replace(/\`/g, '\\`')
        .replace(/\>/g, '\\>')
        // .replace(/\#/g, '\\#')
        // .replace(/\=/g, '\\=')
        // .replace(/\|/g, '\\|')
        .replace(/\_/g, '\\_')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}');
}
