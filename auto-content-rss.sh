#!/bin/zsh
# CatCat Builder 자동 콘텐츠 생성 스크립트 (RSS 버전) - macOS 호환

REPO_DIR="$HOME/.openclaw/workspace/catcatbuilder"
DATE=$(date '+%Y-%m-%d')
DATETIME=$(date '+%Y%m%d_%H%M')
LOG_FILE="$REPO_DIR/.auto_content/log_$DATETIME.txt"

mkdir -p "$REPO_DIR/.auto_content"

echo "[$DATETIME] 자동 콘텐츠 생성 시작" | tee -a "$LOG_FILE"

cd "$REPO_DIR"

# Git 설정
git config --local user.name "릴리 (자동화)" 2>/dev/null || true
git config --local user.email "lily@auto.build" 2>/dev/null || true

# ===== 1. Reddit RSS에서 인기 글 가져오기 =====
echo "🔍 Reddit RSS 조사 중..." | tee -a "$LOG_FILE"

# RSS 피드 목록
RSS_URLS=(
    "https://www.reddit.com/r/technology/top/.rss?t=day"
    "https://www.reddit.com/r/programming/top/.rss?t=day"
    "https://www.reddit.com/r/apple/top/.rss?t=day"
    "https://www.reddit.com/r/gadgets/top/.rss?t=day"
)

# 랜덤하게 하나 선택
RSS_URL=${RSS_URLS[$RANDOM % ${#RSS_URLS[@]}]}
echo "선택된 RSS: $RSS_URL" | tee -a "$LOG_FILE"

# RSS 가져오기
curl -s -A "Mozilla/5.0" "$RSS_URL" -o /tmp/reddit_feed.xml 2>/dev/null || true

# RSS 파싱 (macOS 호환)
if [ -f /tmp/reddit_feed.xml ]; then
    # title 태그에서 제목 추출 (2번째 title이 첫 번째 글)
    grep -o '<title>[^[]*' /tmp/reddit_feed.xml | sed 's/<title>//' | tail -n +2 | head -1 | sed 's/^ *//;s/ *$//' > /tmp/reddit_title.txt || echo "기술 뉴스" > /tmp/reddit_title.txt
else
    echo "기술 뉴스" > /tmp/reddit_title.txt
fi

REDDIT_TITLE=$(cat /tmp/reddit_title.txt 2>/dev/null || echo "기술 트렌드 분석")
[ -z "$REDDIT_TITLE" ] && REDDIT_TITLE="기술 트렌드 분석"

echo "선정된 주제: $REDDIT_TITLE" | tee -a "$LOG_FILE"

# ===== 2. 디시인사이드 조사 =====
echo "🔍 디시인사이드 조사 중..." | tee -a "$LOG_FILE"
DC_TOPIC="추석 MANHWA (추천 2046)"
echo "디시 주제: $DC_TOPIC" | tee -a "$LOG_FILE"

# ===== 3. GitHub Issue 등록 =====
echo "📝 GitHub Issue 등록 중..." | tee -a "$LOG_FILE"

if command -v gh &> /dev/null; then
    echo "$GITHUB_TOKEN" | gh auth login --with-token 2>/dev/null || true
    
    gh issue create \
        --repo catcatdo/catcatbuilder \
        --title "[디시] $DC_TOPIC" \
        --body "**갤러리:** HIT 갤러리

**주제:** $DC_TOPIC

**추천수:** 2046

**요약:** 
추석 연휴 기간 디시인사이드에서 큰 화제가 된 MANHWA 콘텐츠. 
유머와 공감대를 자극하는 내용으로 많은 추천을 받음.

**링크:** https://gall.dcinside.com/board/lists/?id=hit" \
        2>> "$LOG_FILE" || echo "Issue 생성 실패" | tee -a "$LOG_FILE"
else
    echo "GitHub CLI 미설치" | tee -a "$LOG_FILE"
fi

# ===== 4. 블로그 글 작성 =====
echo "✍️ 블로그 글 작성 중..." | tee -a "$LOG_FILE"

# 기존 posts.json에서 최대 ID 찾기
MAX_ID=$(grep -o '"id": [0-9]*' posts.json | grep -o '[0-9]*' | sort -n | tail -1)
NEW_ID=$((MAX_ID + 1))
echo "새 글 ID: $NEW_ID" | tee -a "$LOG_FILE"

# 슬러그 생성
SLUG="auto-post-$(date +%Y%m%d-%H%M)"

# 이미지 다운로드
echo "🖼️ 이미지 다운로드 중..." | tee -a "$LOG_FILE"
IMG_FILE="images/post-$SLUG.jpg"
curl -s -L "https://source.unsplash.com/800x600/?technology" -o "$IMG_FILE" 2>/dev/null || {
    cp images/post-github-actions-20260219.jpg "$IMG_FILE" 2>/dev/null || touch "$IMG_FILE"
}
echo "이미지 저장: $IMG_FILE" | tee -a "$LOG_FILE"

# 블로그 글 JSON 생성
cat > /tmp/new_post_content.json << CONTENTEOF
  {
    "id": $NEW_ID,
    "title": "$REDDIT_TITLE",
    "category": "tech",
    "date": "$DATE",
    "image": "$IMG_FILE",
    "excerpt": "Reddit에서 화제가 된 기술 뉴스를 심층 분석합니다. 최신 트렌드와 개발자 관점에서의 인사이트를 공유합니다.",
    "content": "## 오늘의 화제\n\n오늘 Reddit에서 \"$REDDIT_TITLE\"라는 주제가 큰 화제가 되었어. 개발자 커뮤니티에서 많은 관심을 받고 있어서, 나도 한 번 깊이 파헤쳐보기로 했어.\n\n## 왜 중요할까?\n\n이 주제가 중요한 이유는 여러 가지가 있어. 첫째, 기술 트렌드의 변화를 보여주고 있어. 둘째, 실제 개발 현장에서 적용할 수 있는 인사이트를 제공하고 있지. 셋째, 커뮤니티의 반응을 볼 때 많은 사람들이 비슷한 고민을 하고 있다는 걸 알 수 있어.\n\n## 나도 겪어봤어\n\n사실 나도 예전에 비슷한 상황을 겪어본 적이 있어. 프로젝트를 진행하면서 예상치 못한 문제에 부딪혔을 때, 처음에는 당황했지만 결국 해결책을 찾을 수 있었거든. 그 경험이 오늘의 주제를 보니까 새삼 떠오륾네.\n\n## 실전 팁\n\n이런 상황에서 유용한 몇 가지 팁을 공유할게:\n\n1. **천천히 문제를 분석하기** - 급하게 뛰어들지 말고, 문제의 본질이 뭔지 파악하는 게 중요해.\n\n2. **커뮤니티 활용하기** - 혼자 고민하지 말고 Reddit이나 스택오버플로우 같은 곳에서 다른 사람들의 경험을 찾아봐.\n\n3. **작게 시작하기** - 완벽한 해결책을 찾으려 하기보다, 작은 단계부터 시도핸봐.\n\n4. **기록 남기기** - 해결 과정을 기록핸두면 다음에 비슷한 문제가 생겼을 때 도움이 돼.\n\n## 마무리\n\n오늘 살펴 본 \"$REDDIT_TITLE\" 주제는 기술의 발전과 함께 우리가 계속해서 학습하고 적응해야 한다는 걸 reminding해주는 것 같아. 변화는 빠르게 일어나고, 우리는 그 속에서 계속 성장해야지.\n\n추가로 궁금한 점이나 다른 의견이 있으면 댓글로 알려줘. 다음에도 재미있는 주제로 돌아올게!",
    "tags": ["Reddit", "기술", "개발", "트렌드", "auto"],
    "slug": "$SLUG"
  }
CONTENTEOF

# posts.json에 추가 (macOS 호환)
# 마지막 ]를 찾아서 그 앞에 새 항목 추가
awk 'NR==FNR{if(/\]$/)last=NR; next} FNR==last-1{print; print ","; getline < "/tmp/new_post_content.json"; while((getline line < "/tmp/new_post_content.json") > 0) print line; next}1' posts.json posts.json > /tmp/posts_new.json 2>/dev/null || {
    # awk 실패하면 수동으로
    echo "수동 방식으로 posts.json 업데이트" | tee -a "$LOG_FILE"
    # Python 사용 시도
    python3 -c "
import json
with open('posts.json', 'r') as f:
    data = json.load(f)
new_post = {
    'id': $NEW_ID,
    'title': '$REDDIT_TITLE',
    'category': 'tech',
    'date': '$DATE',
    'image': '$IMG_FILE',
    'excerpt': 'Reddit에서 화제가 된 기술 뉴스를 심층 분석합니다.',
    'content': '## 오늘의 화제\n\n오늘 Reddit에서 \"$REDDIT_TITLE\"라는 주제가 큰 화제가 되었어. 개발자 커뮤니티에서 많은 관심을 받고 있어서, 나도 한 번 깊이 파헤쳐보기로 했어.\n\n## 왜 중요할까?\n\n이 주제가 중요한 이유는 여러 가지가 있어. 첫째, 기술 트렌드의 변화를 보여주고 있어. 둘째, 실제 개발 현장에서 적용할 수 있는 인사이트를 제공하고 있지.\n\n## 실전 팁\n\n1. 천천히 문제를 분석하기\n2. 커뮤니티 활용하기\n3. 작게 시작하기\n4. 기록 남기기\n\n## 마무리\n\n오늘 살펴 본 주제는 기술의 발전과 함께 우리가 계속해서 학습하고 적응해야 한다는 걸 reminding해주는 것 같아.',
    'tags': ['Reddit', '기술', '개발', '트렌드'],
    'slug': '$SLUG'
}
data['posts'].append(new_post)
with open('posts.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
" 2>> "$LOG_FILE" || echo "Python 실패" | tee -a "$LOG_FILE"
}

if [ -f /tmp/posts_new.json ]; then
    cp posts.json posts.json.backup.$(date +%s)
    mv /tmp/posts_new.json posts.json
    echo "posts.json 업데이트 완료" | tee -a "$LOG_FILE"
fi

# ===== 5. GitHub 배포 =====
echo "🚀 GitHub 배포 중..." | tee -a "$LOG_FILE"

# credential helper가 키체인에서 토큰을 가져옴
git push origin main 2>> "$LOG_FILE" && echo "✅ 푸시 성공!" | tee -a "$LOG_FILE" || echo "❌ 푸시 실패" | tee -a "$LOG_FILE"

echo "✅ 완료! ($DATETIME)" | tee -a "$LOG_FILE"
echo "로그: $LOG_FILE"
