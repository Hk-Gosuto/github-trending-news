import { Service } from '@volcengine/openapi';
import { ResponseMetadata } from '@volcengine/openapi/lib/services/acep/types';

const accessKeyId = process.env.VOLC_ACCESS_KEY_ID!;
const secretKey = process.env.VOLC_SECRET_KEY!;

export async function Translate(text: string, sourceLanguage: string = 'en', targetLanguage: string = 'zh') {
    const postBody = {
        SourceLanguage: sourceLanguage,
        TargetLanguage: targetLanguage,
        TextList: [text],
    };
    var ret = await fetchApi(postBody);
    var translateResult = ret as ITranslateResult;
    return translateResult.TranslationList[0].Translation;
}

const service = new Service({
    host: "translate.volcengineapi.com",
    serviceName: "translate",
    region: "cn-north-1",
    accessKeyId,
    secretKey,
});

export interface ITranslateResult {
    ResponseMetadata: ResponseMetadata;
    TranslationList: ITranslation[];
}

export interface ITranslation {
    Translation: string;
    DetectedSourceLanguage: string;
}

const fetchApi = service.createAPI("TranslateText", {
    Version: "2020-06-01",
    method: "POST",
    contentType: "json",
});
