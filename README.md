# 每日 GitHub Trending 推送

频道：[t.me/github_day_trending](https://t.me/github_day_trending)

## 主要功能

- 每天 12:10 PM（北京时间） 推送当日 GitHub Trending 列表
- ~~使用 [火山翻译](https://translate.volcengine.com/api) 将项目描述翻译为中文~~
- ~~使用 glm-4 将项目描述翻译为中文~~
-  支持多 ai 模型提供者

## 配置

- MODEL_NAME
  - 指定 ai 模型名称
- AI_PROVIDER (可选)
  - 指定 ai 提供商，默认 openai，可选值：openai, anthropic, deepseek, google, groq, xai
- AI_API_KEY
  - ai api key
- AI_BASE_URL (可选)
  - ai base url
- TELEGRAM_TOKEN
  - telegram token
- TELEGRAM_CHANNEL_ID
  - telegram channel id

## 计划

- [x] 对接 telegram 机器人推送
- [x] 对接 火山翻译 引擎
- [ ] 对接 supabase 数据持久化
- [ ] 使用 supabase 过滤重复历史推送项目
- [ ] 对接 openai 对 start 最高的几个项目编写每日总结