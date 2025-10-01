---
slug: kobo-highlights-lost
title: 【記錄】Kobo 劃記遺失驚魂記
tags: [Programming]
date: 2025-10-01
---

去年入坑閱讀器 [^eReader] 時，我也一併試用了 Readwise 2 個月，主要是看上它可以同步 Kobo 的閱讀劃記，並且輸出到 Notion。  
實際使用後最吸引我的是「劃記回顧」的功能，可以指定哪幾本書要以何等頻率發送 email 複習。由於我主要讀的是比較偏理論的書籍，所以非常中意這個功能！  

不過問題是我不太想再增加我手上的訂閱產品了，雖然 6 鎂 / 月看似還好，但累積起來也是挺可觀的……而且當時還不確定自己能不能堅持閱讀的習慣。  
那時剛好有訂 Perplexity 付費版，於是就趁這個機會和它協作出一個也能匯出劃記到 Notion 書庫、每日寄出 email 的小腳本。
成果像是這樣：

以《我想跟你好好說話》為例：

還有我愛的複習功能：

像是中間還遇到
學習到：

- 使用 Windows 的 Task Scheduler 排程 powershell 腳本並間接呼叫 WSL2 的 python script
- 用 .env 包機密資訊
- 用 Python 寄 email
- 用 Python 串 Notion API：這點 AI 真的幫了大忙，省去慢慢看官方文件的時間
- 複習 SQL [^sql]

我原本大概是一個月會手動
```sql
SELECT Bookmark.VolumeID, Bookmark.Text, Bookmark.Annotation, Bookmark.DateCreated, Bookmark.DateModified, content.BookTitle, content.Title, content.Attribution FROM Bookmark INNER JOIN content ON Bookmark.VolumeID = content.BookID;
38 本
SELECT DISTINCT Bookmark.VolumeID, content.BookTitle, content.ISBN FROM Bookmark INNER JOIN content ON Bookmark.VolumeID = content.BookID WHERE content.BookTitle IS NOT NULL AND Bookmark.Text != '' ORDER BY content.BookTitle;

8 本
SELECT DISTINCT Bookmark.VolumeID, content.BookTitle, content.ISBN FROM Bookmark INNER JOIN content ON Bookmark.VolumeID = content.BookID;
```

SELECT DISTINCT Bookmark.VolumeID, content.BookTitle, content.Title, content.Attribution, content.ISBN FROM Bookmark;


SELECT Bookmark.VolumeID, content.BookTitle, content.Title, content.Attribution, content.ISBN FROM Bookmark INNER JOIN content ON Bookmark.VolumeID = content.ContentID;

SELECT DISTINCT Bookmark.VolumeID, content.BookTitle, content.Title, content.Attribution, content.ISBN FROM Bookmark
SELECT DISTINCT content.BookTitle, content.Title, content.Attribution, content.ISBN FROM content;

我可能錯了 Bookmark.VolumeID baf25480-5f8d-48e4-b0d7-bbd004c64f8f
content.ContentID
會有一筆 ContentID 是與 VolumeID 相等：
ContentID ContentType MimeType BookId 為空！
baf25480-5f8d-48e4-b0d7-bbd004c64f8f	6	application/x-kobo-epub+zip	 NULL
ImageId 與 Description 非空，可能是封面頁

其他則像是記錄書的章節內容資訊一般（此時會和 BookId 吻合）：
ContentID ContentType MimeType BookId Title
baf25480-5f8d-48e4-b0d7-bbd004c64f8f!item!xhtml/p-cover.xhtml	9	application/xhtml+xml	baf25480-5f8d-48e4-b0d7-bbd004c64f8f	xhtml/p-cover.xhtml

還有這種，我猜是章節：
BookTitle Title
baf25480-5f8d-48e4-b0d7-bbd004c64f8f!item!xhtml/p-colophon.xhtml-1	899	application/x-kobo-epub+zip	baf25480-5f8d-48e4-b0d7-bbd004c64f8f	我可能錯了：森林智者的最後一堂人生課【瑞典每30人就1人閱讀．韓國2022讀者最愛年度之書】		版權頁
會出現在 baf25480-5f8d-48e4-b0d7-bbd004c64f8f!item!xhtml/p-colophon.xhtml

BookmarkID VolumeID ContentID
9c82c657-458f-4faf-aba2-190863ed8094	baf25480-5f8d-48e4-b0d7-bbd004c64f8f	baf25480-5f8d-48e4-b0d7-bbd004c64f8f!item!xhtml/p-021.xhtml
[]把 StartContainerPath 結合章節資訊，應該可以做到貞的排序？
 

交叉驗證：拿舊的 sqlite 執行


會如下圖這樣分裂：

起初懷疑是透過線上資料，但是啟用 FeatureSettings 後，

技術文章要不要分開？

[^eReader]: 剛好趁 9 月周年慶購入 Kobo Libra Colour（7 吋）

[^sql]: 上次碰資料庫應該是大二修課、大三做專題，10 年過去了！😱