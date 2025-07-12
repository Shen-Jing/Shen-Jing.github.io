---
title: Hexo 初建踩雷
date: 2025-07-12 19:29:32
tags: IT
---

參考自 [No.1 搭建Hexo博客，快速简洁高效，零成本搭建个人博客：Hexo + GitHub Pages + Cloudflare Pages 完整指南](https://youtu.be/GtYcFZ55GJI?si=a69eTVCjHsWetgPE)

2018 年升碩一的暑假就有弄來玩過了，結果後續一篇文章都沒弄XD，只有弄個 Hexo 的 TODO list：

現在 AI 興起，CSS 什麼的應該不是太大問題了吧！

## CloudFlare 踩雷

一開始照著影片部署，設定都沒加直接遇到錯誤：

```log
18:18:39.817 If are uploading a directory of assets, you can either:
18:18:39.817 - Specify the path to the directory of assets via the command line: (ex: `npx wrangler deploy --assets=./dist`)
18:18:39.817 - Or create a "wrangler.jsonc" file containing:
18:18:39.817
18:18:39.818 ```
18:18:39.818 {
18:18:39.818 "name": "worker-name",
18:18:39.818 "compatibility_date": "2025-07-12",
18:18:39.818 "assets": {
18:18:39.818 "directory": "./dist"
18:18:39.819 }
18:18:39.819 }
18:18:39.819 ```
18:18:39.819
18:18:39.819
18:18:39.819
18:18:39.820
18:18:39.820 Cloudflare collects anonymous telemetry about your usage of Wrangler. Learn more at https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler/telemetry.md
18:18:39.837 🪵 Logs were written to "/opt/buildhome/.config/.wrangler/logs/wrangler-2025-07-12_10-18-38_813.log"
18:18:40.039 Failed: error occurred while running deploy command
```

照著 log 建立 wrangler.jsonc：

```jsonc
{
  "name": "github-pages",
  "compatibility_date": "2025-07-12",
  "assets": {
    "directory": "public"
  }
}
```

要點：

- name 不可是 "worker-name"，否則錯誤：Update wrangler.jsonc in your repo to keep settings consistent. On Wrangler v3.109.0+, we will auto-generate a PR to fix this after the build
- dir 的部分因為 hexo 的內容目錄是在 public

### Final build settings

```log
Build command: npm run build
Deploy command: npx wrangler deploy
Version command: npx wrangler versions upload
Root directory:
```

Deploy command 留空，build 後會發現它會自行填上；
Root 特意留空，用預設的 / 會有問題；
Build command 用 hexo generate 會有錯誤：

```log
18:43:00.506 Initializing build environment...
18:43:08.784 Success: Finished initializing build environment
18:43:08.951 Cloning repository...
18:43:09.896 No build output detected to cache. Skipping.
18:43:09.896 No dependencies detected to cache. Skipping.
18:43:09.901 Detected the following tools from environment:
18:43:09.908 Executing user build command: hexo generate
18:43:09.916 /bin/sh: 1: hexo: not found
18:43:09.925 Failed: error occurred while running build command
```

改成 `npm run build` 和 package.json (似乎是 npm 安裝 hexo-cli 產生的，裡面有 scripts 等設定) 才解決。
