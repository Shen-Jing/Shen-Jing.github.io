---
slug: Metronome
title: 【音樂】Vibe Coding：節奏機
tags: [music, programming]
date: 2025-12-31
---

在 [不管什麼節奏，都能彈對的練習秘訣！](https://youtu.be/NkYhAmIGSOw?si=phI9voj6dWKsHx0A) 中，好和弦老師把五線譜的節奏這件事講的非常好懂，對於最近開始在用哈農練變奏的我，實在是獲益良多！  
其中他還有科普了一下 Step Sequencer 這種玩意，只可惜在網路上找了一下沒特別好用的，要不就是要付費（也不知道實際好用程度）的 app。  

最近剛好將 Google One 的訂閱升級，剛好來試一下他們家的 Antigravity 的 Vibe Coding 體驗如何。  
成果如圖：
![My metronome](/img/img_programming/Metronome.png)

開源專案傳送門（含 README）：https://github.com/Shen-Jing/metronome  

<!-- truncate -->

大概歷經了幾次來回改進需求：  

- 不知道 BPM 該調多快：提供自定義最小的每格節奏速度 (Subdivision BPM)
- 想要定義幾格為一拍：Steps per Beat
  - 圖例：4 格為一拍，以 BPM 60 執行每 4 格；像我這個例子就是在模擬「4 分音符為 1 拍，最小節奏單位為 16 分音符，因此將 1 拍劃為 4 格」
- 每次重新劃格子很麻煩：支援 Save & Load

為了方便自己從手機叫出來用，我把它放到我的網站上了：https://shenjing.me/metronome

最後也要推廣老師的 [不囉嗦的節拍器](https://nicechord.com/post/metronome-v3/)，受他啟發我才會以靜態網頁的形式，否則我可能會往桌面應用程式或是 app 等較複雜的手段去發想。  
（也是因為我不想算出拍子後還要算數學，所以才寫這個程式XD）