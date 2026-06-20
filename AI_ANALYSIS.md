# AI 分析 Branch 使用說明 (Cheat Sheet)

這個 `ai-analysis` branch 只用來存放 AI 針對 `main` 文章所做的「額外分析 / 改寫」產物。
它**不會合併回 `main`、也不會被部署**（網站只從 `gh-pages` 發佈）。

## 目前內容

- `blog/2026/成發文章_*.md`：AI 對〈人生首次的成果發表〉各面向的分析報告
- `blog/2026/p_收斂深化版.md`：AI 改寫 / 收斂深化版本
- 之後新的 AI 產物也放這裡

## 設計原則（為什麼幾乎不用解 conflict）

這個 branch **只新增 `main` 上沒有的檔案**，從不修改 `main` 既有的檔案。
因此把最新的 `main` 併進來時，不會出現「同一個檔案兩邊都改」的重疊衝突。

## 偶爾 sync 到最新 main

最簡單的方式是直接跑腳本（下面那串步驟的自動化版本，會自動處理罕見的衝突）：

```bash
./sync-ai-analysis.sh            # fetch → 切到 ai-analysis → 併 main → push
./sync-ai-analysis.sh --no-push  # 只在本地同步，不要 push
./sync-ai-analysis.sh -h         # 看完整說明
```

它做的事等同於下面這幾步：

```bash
git checkout ai-analysis
git fetch origin
git merge origin/main        # 幾乎都會乾淨地自動合併
git push origin ai-analysis  # (可選) 把同步後的結果推上去
```

### 萬一真的跳出 conflict（很罕見）

一律以 `main` 為準即可，這個 branch 本來就不該去動 `main` 的檔案：

```bash
git merge -X theirs origin/main
```

`-X theirs` 會在衝突的片段一律採用 `main` 的版本，而這個 branch 新增的檔案不會被影響。

## 注意事項

- 不要把 `ai-analysis` 合併進 `main`（這只是分析草稿，不採用）。
- 新增分析檔時，請放在這個 branch、且使用 `main` 沒有的新檔名，維持「只新增、不改動」的原則。
- 不想要時可直接刪掉：
  ```bash
  git branch -D ai-analysis
  git push origin --delete ai-analysis
  ```
