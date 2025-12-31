---
slug: kobo-highlights-lost
title: 【記錄】Kobo 劃記遺失驚魂記
tags: [programming]
date: 2025-10-01
---

## 前言

去年入坑閱讀器 [^eReader] 時，我也一併試用了 Readwise 2 個月，主要是看上它可以同步 Kobo 的閱讀劃記，並且輸出到 Notion。  
實際使用後最吸引我的是「劃記回顧」的功能，可以指定哪幾本書要以何等頻率發送 email 複習。由於我主要讀的是比較偏理論的書籍，所以非常中意這個功能！  

不過問題是我不太想再增加我手上的訂閱產品了，雖然 6 鎂 / 月看似還好，但累積起來也是挺可觀的……而且當時還不確定自己能不能堅持閱讀的習慣。  
那時剛好有訂 Perplexity 付費版，於是就趁這個機會和它協作出一個也能匯出劃記到 Notion 書庫、每日寄出 email 的小腳本。

<!-- truncate -->

### export-kobo 小成果

基於 [pettarin/export-kobo](https://github.com/pettarin/export-kobo) 的架構，初版在 2025 年 1 月完成。

以《我想跟你好好說話》為例，這是輸出到 Notion 的樣子（預設直輸到頁面尾端，並以 toggleable 的 H3 標題為區塊）：  
![talk](/img/img_Kobo/Notion_Highlights.png)

還有我愛的複習功能：  
![review](/img/img_Kobo/to_email.jpg)

#### 主要難點

- KoboReader.sqlite 的 Bookmark 資料排序困難，有 `StartContainerPath`，但資訊不夠充足，排下去亂成一團。  
  （最後我粗暴的 work around 是利用 `DateCreated`，畢竟我自己看書都是從頭照順序看）
- 原本是利用中文標題去和 Notion 頁面連結，但我基本資料是先用 Save To Notion 從博客來頁面去抓的，中文書名與 Kobo 資料庫不一致。
  - 解法：用 ISBN 做配對，**但是** 電子書與實體書的 ISBN 不一樣，而且其中一個書城還會混用兩者。因此我只好在輸出前除了列出標題方便選取以外，還多列 Kobo 資料庫內的 ISBN，用工人智慧複製貼上到 Notion 頁面讓它可以吻合……  
  否則就是預設輸出到 ISBN 為 0 的頁面，接著我再手動去剪下貼上輸出的結果。

#### 學習點

- 使用 Windows 的 Task Scheduler 排程 powershell 腳本並間接呼叫 WSL2 的 python script
- 用 .env 包機密資訊
- 用 Python 寄 email
- 用 Python 串 Notion API：這點 AI 真的幫了大忙，省去慢慢看官方文件的時間
- 複習 SQL [^sql]

## 事件如何發生

在多開閱讀（同時期不只讀一本書）下，我大概是一個月會有一本書讀完並需要整理劃記，這也成為我會手動備份 KoboReader.sqlite 的時機點。  
這次因為比較懶，所以就直接沒有額外備份一份，只有單純以上次 7 月時的版本作為備份。  

而意外就發生在我執行完腳本後又快速地再重複執行一次，結果壞檔：  
![sql_broken](/img/img_Kobo/sqlite_broken.png)

這個錯誤訊息會發生在讀取 sqlite 遇到狀況時拋出的 exception。  
（老實說這是不是當下第一時間的狀況圖我也不確定，因為從可擷取劃記的書本數量來看是偏少的，但從前後執行結果推論又是第一現場的最佳可能）  
推測可能是因為底層還沒將 sqlite-shm (Shared Memory) 或 sqlite-wal (Write-Ahead Logging) 等等的檔案整合回去（有誤還敬請斧正，我外行XD）。

這時最奇妙的是，我再重新插線閱讀器取出 sqlite，問題依舊存在——我甚至開始懷疑是不是我 <kbd>Ctrl</kbd> <kbd>c</kbd> / <kbd>v</kbd> 太順，所以不小心把毀損的檔案覆蓋掉閱讀器上的檔案。  

## Debug 思路

事到如今只能認了，不過還是記錄一些 debug 過程[^memo]，也算是更認識到 Kobo 有哪些資料可以運用吧。  

首先是原本的 SQL 語句如何將存有劃記的書本抓出來：  
Bookmark 表並沒有記錄書名，有的是 `VolumeID`，而 content 表記錄各種書籍相關的資訊，因此要用 `Bookmark.VolumeID = content.BookID` 去做吻合。

```sql
SELECT Bookmark.VolumeID, Bookmark.Text, Bookmark.Annotation, Bookmark.DateCreated, Bookmark.DateModified, content.BookTitle, content.Title, content.Attribution FROM Bookmark INNER JOIN content ON Bookmark.VolumeID = content.BookID;
```

而毀損後我發現 content 表找不到存在 `BookID` 可以吻合的資料，要不然就是某些欄位的資料應該要有卻是空的，所以我做了一些嘗試：  

```sql
/* 1 */
SELECT DISTINCT Bookmark.VolumeID, content.BookTitle, content.ISBN FROM Bookmark INNER JOIN content ON Bookmark.VolumeID = content.BookID WHERE content.BookTitle IS NOT NULL AND Bookmark.Text != '' ORDER BY content.BookTitle;
SELECT DISTINCT Bookmark.VolumeID, content.BookTitle, content.ISBN FROM Bookmark INNER JOIN content ON Bookmark.VolumeID = content.BookID;
```

後來我想到的交叉驗證是拿舊的 sqlite (7 月) 來比較，才更確認現在資料的缺損。  

關於一些欄位的認識，以《我可能錯了》為例，`Bookmark.VolumeID` 為 baf25480-5f8d-48e4-b0d7-bbd004c64f8f，在 content 表搜尋任意 column，會有一筆 `ContentID` 是與 `VolumeID` 相等：  
（有意思的是，`BookId` 為空！從 `ImageId` 與 `Description` 非空推測：可能是封面頁）  
| ContentID                            | ContentType | MimeType                    | BookId |
|--------------------------------------|-------------|-----------------------------|--------|
| baf25480-5f8d-48e4-b0d7-bbd004c64f8f | 6           | application/x-kobo-epub+zip | NULL   |

其他則像是記錄書的章節內容（此時會和 `VolumeID` 會和 `BookId` 吻合），會有兩筆資料用 `Title` 分別記錄「第13章　有魔法的箴言」和「xhtml/p-013.xhtml」相似的資料，只差在 `ContentType` 不同：  
![ContentType](/img/img_Kobo/sqlite_ContentType.png)

此時我猜把 Bookmark 表中的 `StartContainerPath` 結合這裡看到的章節資訊，應該可以做到完全的劃記排序？

### 還原方法？

我拿前一次的備份覆蓋掉現在閱讀器上毀損的資料，再啟動同步：  

- 閱讀時間數據停留在該次備份 (330 小時)
- `Bookmark.VolumeID = content.BookID` 可以抓出吻合，資料還算正常
- ⚠️ 新增的劃記不會更新到 sqlite，資料彷彿凍結，而且最重要的是在閱讀器內部檢視，全部都空的！

推估是因為 8 月時 Kobo 有更新過一次，所以導致要以那之前的 sqlite 資料來做基底會有問題。

最後只好把被我弄壞掉的 sqlite 再丟回去覆蓋，再同步：

- 閱讀時間數據——440 小時，啪地沒了。
- 新增的劃記可以更新到 sqlite，在閱讀器內部檢視還都能檢視到舊的劃記

還有些書籍無法開啟的問題，只要移除閱讀器上的書籍資料再重新下載即可。

還有一個交叉測試是，我開啟 `Kobo eReader.conf` 的設定：  

```
[FeatureSettings]
ExportHighlights=true
```

這樣輸出的劃記是**正常**的，儘管我的 sqlite 是壞的，甚至我到 Bookmark 表查不到我新增的劃記內容。  
讓我非常好奇這些正常的劃記是不是從線上的資料庫而來的，算了也無從得知。  

就先記錄到這裡吧，學到的教訓就是：不要貪圖一時方便不備份……

[^eReader]: 剛好趁 9 月周年慶購入 Kobo Libra Colour（7 吋）

[^sql]: 上次碰資料庫應該是大二修課、大三做專題，10 年過去了！😱

[^memo]: 由於斷斷續續寫這篇文章，等到真的正式記錄已經要 2 週過去，我已經有點看不懂我當初的 memo ㄌ…