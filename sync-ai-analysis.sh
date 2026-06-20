#!/usr/bin/env bash
#
# sync-ai-analysis.sh
# ---------------------------------------------------------------------------
# 把最新的 `main` 同步進 `ai-analysis` branch，並（預設）推上 origin。
# 這支腳本就是 AI_ANALYSIS.md「偶爾 sync 到最新 main」那一節的自動化版本：
#
#     git checkout ai-analysis
#     git fetch origin
#     git merge origin/main          # 幾乎都會乾淨地自動合併
#     git push origin ai-analysis     # (可選)
#
# 設計原則：ai-analysis 只「新增」main 沒有的檔案、從不改動 main 既有檔案，
# 所以併入 main 時極少出現衝突；萬一出現，一律以 main 為準（git merge -X theirs）。
#
# 用法：
#     ./sync-ai-analysis.sh            # fetch → 切到 ai-analysis → 併 main → push
#     ./sync-ai-analysis.sh --no-push  # 同上，但不要 push（只在本地同步）
#     ./sync-ai-analysis.sh --theirs   # 一開始就用 -X theirs（衝突全採 main）
#     ./sync-ai-analysis.sh -h         # 顯示說明
#
# 可用環境變數覆寫預設值（給其他 branch 重用）：
#     BRANCH=ai-analysis  BASE=main  REMOTE=origin
# ---------------------------------------------------------------------------
set -euo pipefail

# ---- 可調設定 -------------------------------------------------------------
BRANCH="${BRANCH:-ai-analysis}"   # 要被同步的目標 branch
BASE="${BASE:-main}"              # 要併進來的來源 branch
REMOTE="${REMOTE:-origin}"        # 遠端名稱

DO_PUSH=1        # 預設 sync 完直接 push
FORCE_THEIRS=0   # 預設先嘗試乾淨合併，衝突才退回 -X theirs

# ---- 小工具：彩色訊息 -----------------------------------------------------
if [[ -t 1 ]]; then
  C_RESET=$'\033[0m'; C_BLUE=$'\033[1;34m'; C_GREEN=$'\033[1;32m'
  C_YELLOW=$'\033[1;33m'; C_RED=$'\033[1;31m'
else
  C_RESET=""; C_BLUE=""; C_GREEN=""; C_YELLOW=""; C_RED=""
fi
step() { printf '%s\n' "${C_BLUE}▶ $*${C_RESET}"; }
ok()   { printf '%s\n' "${C_GREEN}✔ $*${C_RESET}"; }
warn() { printf '%s\n' "${C_YELLOW}⚠ $*${C_RESET}"; }
die()  { printf '%s\n' "${C_RED}✗ $*${C_RESET}" >&2; exit 1; }

usage() {
  cat <<'EOF'
sync-ai-analysis.sh — 把最新的 main 同步進 ai-analysis 並（預設）push

用法：
  ./sync-ai-analysis.sh            fetch → 切到 ai-analysis → 併 main → push
  ./sync-ai-analysis.sh --no-push  只在本地同步，不要 push
  ./sync-ai-analysis.sh --theirs   一開始就用 -X theirs（衝突全採 main）
  ./sync-ai-analysis.sh -h         顯示這份說明

環境變數（可覆寫預設，給其他 branch 重用）：
  BRANCH=ai-analysis  BASE=main  REMOTE=origin
EOF
  exit 0
}

# ---- 解析參數 -------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-push)  DO_PUSH=0 ;;
    --push)     DO_PUSH=1 ;;
    --theirs)   FORCE_THEIRS=1 ;;
    -h|--help)  usage ;;
    *)          die "未知參數：$1（用 -h 看說明）" ;;
  esac
  shift
done

# ---- 0. 前置檢查 ----------------------------------------------------------
git rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  || die "這裡不是 git repo。"

# 一定要在 repo 根目錄執行，這樣從任何子資料夾呼叫都 OK
cd "$(git rev-parse --show-toplevel)"

# 工作目錄若有「已追蹤檔案」的未提交變更，先擋下來，避免切 branch / 合併失敗。
# （未追蹤的新檔案不影響，所以用 --untracked-files=no 略過。）
if ! git diff --quiet || ! git diff --cached --quiet; then
  git status --short --untracked-files=no
  die "工作目錄有未提交的變更，請先 commit 或 stash 後再同步。"
fi

ORIGINAL_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

# ---- 1. fetch -------------------------------------------------------------
step "Fetch ${REMOTE}（${BASE} + ${BRANCH}）"
git fetch "$REMOTE" "$BASE" "$BRANCH"

# ---- 2. 切到目標 branch ---------------------------------------------------
step "切換到 ${BRANCH}"
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  git checkout "$BRANCH"
elif git show-ref --verify --quiet "refs/remotes/${REMOTE}/${BRANCH}"; then
  git checkout -b "$BRANCH" --track "${REMOTE}/${BRANCH}"
else
  die "找不到 branch ${BRANCH}（本地與 ${REMOTE} 都沒有）。"
fi

# 先把本地 branch 快轉到遠端最新狀態（別台機器可能已推過東西），
# 這樣最後 push 才不會被 non-fast-forward 擋下。
if git show-ref --verify --quiet "refs/remotes/${REMOTE}/${BRANCH}"; then
  if git merge-base --is-ancestor "$BRANCH" "${REMOTE}/${BRANCH}"; then
    step "快轉 ${BRANCH} → ${REMOTE}/${BRANCH}"
    git merge --ff-only "${REMOTE}/${BRANCH}"
  elif ! git merge-base --is-ancestor "${REMOTE}/${BRANCH}" "$BRANCH"; then
    warn "本地 ${BRANCH} 與 ${REMOTE}/${BRANCH} 已分歧，略過快轉；push 時若被擋請自行處理。"
  fi
fi

# ---- 3. 把 main 併進來 ----------------------------------------------------
if [[ "$FORCE_THEIRS" -eq 1 ]]; then
  step "合併 ${REMOTE}/${BASE}（-X theirs，衝突一律採 ${BASE}）"
  git merge --no-edit -X theirs "${REMOTE}/${BASE}"
else
  step "合併 ${REMOTE}/${BASE}"
  if git merge --no-edit "${REMOTE}/${BASE}"; then
    ok "乾淨合併完成。"
  else
    warn "出現衝突 → 依 AI_ANALYSIS.md 原則退回 -X theirs（一律以 ${BASE} 為準）。"
    git merge --abort
    git merge --no-edit -X theirs "${REMOTE}/${BASE}"
  fi
fi
ok "${BASE} 已同步進 ${BRANCH}。"

# ---- 4. push --------------------------------------------------------------
if [[ "$DO_PUSH" -eq 1 ]]; then
  step "推送 ${BRANCH} → ${REMOTE}"
  git push "$REMOTE" "$BRANCH"
  ok "已推上 ${REMOTE}/${BRANCH}。"
else
  warn "已略過 push（--no-push）。需要時手動執行：git push ${REMOTE} ${BRANCH}"
fi

printf '\n'
ok "完成！目前在 ${BRANCH}（原本在 ${ORIGINAL_BRANCH}）。"
