---
slug: Docusaurus_settings
title: Docusaurus 記錄
tags: [docusaurus]
description: This is my first post on Docusaurus.
date: 2025-08-23
---

這篇用來當作自己的小筆記，或是如果荒廢多時未更新可以拿來當 cheat sheet。

## 文章相關

### 新增文章

1. `blog/`
2. md 檔最前面要有 [front matter](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog#markdown-front-matter)
3. `npm run start` 本地測試，隨改隨見
4. `npm run deploy`（部署到 Pages）

#### front matter

- `sluga: 網址路徑（可自訂）
- `authors`: 去掉就不會有作者資訊（大頭貼那些）
  - 題外話：填入 `authors.yml` 沒有的作者還會有 deploy error，防呆做挺好的😆
- `last_update`: 可和 `date` 區分
