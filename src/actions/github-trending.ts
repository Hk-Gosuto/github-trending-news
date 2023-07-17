import axios from 'axios';
import * as cheerio from 'cheerio';
import { sendMessage } from '../utils/telegramApi';
import { Translate } from '../utils/volcTranslate';

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
                const repoTitle = repoTitleA.text().replace(/\n/g, '').replace(/ /g, '').trim();
                const repoHref = repoTitleA.attr('href');
                const repoLanguageSpan = $(b).find('>div').last().find('>span>span').last();
                const repoLanguage = repoLanguageSpan.text().trim();
                const repoStar = $(b).find('>div').last().find('>a').first().text().trim();
                const repoFork = $(b).find('>div').last().find('>a').last().text().trim();

                const repoDesc = $(b).find('>p').text().replace(/\n/g, '').trim();
                list.push({
                    title: repoTitle,
                    href: `https://github.com${repoHref}`,
                    description: repoDesc,
                    language: repoLanguage,
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
        tempBody += `🧰: ${item.language} 🌟: ${item.star} 🔀: ${item.fork}\n`;
        if (item.description) {
            tempBody += `💬: ${item.description}\n`;
            let descriptionCN = await Translate(item.description);
            tempBody += `🇨🇳: ${descriptionCN}\n`;
        }
        tempBody += '\n';
        if ((body.length + tempBody.length) > (maxCharacters - 500)) {
            await sendMessage(body).then(console.log).catch(console.error);
            body = `${title} Part ${++partIndex}\n`;
        }
        else {
            body += tempBody;
        }
    }
    await sendMessage(body).then(console.log).catch(console.error);
};

run(new Date()).catch((err) => {
    throw err;
});