---
title: {{ title }} #【必需】頁面標題
date: {{ date }} #【必需】頁面建立日期
updated: #【可選】頁面更新日期
tags: #【可選】文章標籤
categories: #【可選】文章分類
keywords: #【可選】文章關鍵字
description: #【可選】文章描述
top: # 1 置頂
top_img: #【可選】文章頂部圖片
comments: #【可選】顯示文章評論模組(預設 true)
cover: https://img.090227.xyz/file/ae62475a131f3734a201c.png #【可選】文章縮圖(如果沒有設定 top_img,文章頁頂部將顯示縮圖，可設為 false/圖片地址/留空)
toc: #【可選】顯示文章 TOC(預設為設定中 toc 的 enable 配置)
toc_number: #【可選】顯示 toc_number(預設為設定中 toc 的 number 配置)
toc_style_simple: #【可選】顯示 toc 簡潔模式
copyright: #【可選】顯示文章版權模組(預設為設定中 post_copyright 的 enable 配置)
copyright_author: #【可選】文章版權模組的文章作者
copyright_author_href: #【可選】文章版權模組的文章作者連結
copyright_url: #【可選】文章版權模組的文章作者連結
copyright_info: #【可選】文章版權模組的版權聲明文字
mathjax: #【可選】顯示 mathjax(當設定 mathjax 的 per_page: false 時，才需要設定，預設 false)
katex: #【可選】顯示 katex(當設定 katex 的 per_page: false 時，才需要設定，預設 false)
aplayer: #【可選】在需要的頁面載入 aplayer 的 js 和 css，請參考文章下方的音樂配置
highlight_shrink: #【可選】設定程式碼框是否展開(true/false)(預設為設定中 highlight_shrink 的配置)
aside: #【可選】顯示側邊欄 (預設 true)
swiper_index: 10 #【可選】首頁輪播圖設定 index 索引，數字越小越靠前
top_group_index: 10 #【可選】首頁右側卡片組設定，數字越小越靠前
ai: #【可選】文章 ai 摘要
background: "#fff" #【可選】文章主色，必須是 16 進位顏色且有 6 位，不可縮寫，例如 #ffffff 不可寫成 #fff
---

<div class="video-container">
[影片內嵌程式碼貼在這裡]
</div>

<style>
.video-container {
    position: relative;
    width: 100%;
    padding-top: 56.25%; /* 16:9 aspect ratio (height/width = 9/16 * 100%) */
}

.video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
