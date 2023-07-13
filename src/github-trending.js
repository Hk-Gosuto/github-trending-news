"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
// import { Octokit } from '@octokit/action';
// const octokit = new Octokit();
// const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/');
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    const list = [];
    try {
        console.log('start fetching list');
        let res = yield axios_1.default.get('https://github.com/trending');
        if (res.data) {
            const $ = yield cheerio.load(res.data);
            const $repoList = $('.Box .Box-row');
            $repoList.each((a, b) => {
                const repoTitleA = $(b).find('>h2>a');
                const repoHref = repoTitleA.attr('href');
                const repoDesc = $(b).find('>p').text().replace(/\n/g, '').trim();
                list.push({
                    href: `https://github.com${repoHref}`,
                    description: repoDesc
                });
            });
        }
        else {
            console.warn('get html error');
        }
    }
    catch (e) {
        console.warn(e);
    }
    return list;
});
const run = (date) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(date);
    let res = yield fetchData();
    console.log(res);
    let title = date.toISOString().substring(0, 10) + ' Github Trending';
    let labels = ['github'];
    let body = '';
    for (let item of res) {
        body += `- ### [**${item.href.substring(1)}**](https://github.com${item.href})\n\n`;
        body += `    ${item.description}\n\n`;
    }
    // const { data } = await octokit.issues.create({ owner, repo, title, body, labels });
    // console.log(data);
});
run(new Date()).catch((err) => {
    throw err;
});
