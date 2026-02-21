# CatCat Builder 홈페이지 개편 - 방안 C: 테크 뉴스 큐레이션

## 작업 목표
"개발자를 위한 해커뉴스" 스타일의 뉴스 큐레이션 사이트

## 작업 내용

### 1. 메인 컨셉 변경
```
헤드라인: "오늘의 개발자 뉴스"
서브: "Reddit, 디시, 해커뉴스 핫한 주제 큐레이션"
실시간 업데이트 배지 (Live)
```

### 2. RSS 피드 스타일 UI
```html
- 타임라인 형식 (세로 선)
- 뉴스 카드:
  - 썸네일 이미지
  - 제목 (클릭 시 원문)
  - 3줄 요약
  - 태그 (Docker, AI, GitHub)
  - 출처 (r/apple, 디시)
  - 업보트/추천 수
  - 시간 (2시간 전)
```

### 3. 태그 필터 시스템
```javascript
const tags = ['All', 'Docker', 'GitHub', 'AI', 'Apple', 'Frontend', 'Backend'];
// 클릭하면 해당 태그만 필터링
```

### 4. 콘텐츠 개선 (자동 생성 글)
```python
# auto-content-rss.sh 개선
- 길이: 500자 → 2000자 이상
- 구조:
  - 요약 (3줄)
  - 본문 (상세 설명)
  - 핵심 포인트 (bullet)
  - 원문 링크
  - 관련 글 추천
```

### 5. 주간 뉴스레터
```
newsletter.html:
- 이메일 구독 폼
- 지난 뉴스레터 아카이브
- 샘플: "이번 주 개발자 커뮤니티 핫한 10가지"
```

### 6. 소셜 기능
```javascript
// 공유 버튼
- Twitter/X 공유
- Threads 공유
- Hacker News 제출
- 복사 링크

// 간단한 투표 (선택)
- upvote/downvote (로컬스토리지)
```

### 7. API 엔드포인트
```
/api/posts.json - 전체 글
/api/latest.json - 최신 10개
/api/tags.json - 태그 목록
```

### 8. 댓글 시스템 (선택)
```html
<!-- utterances (GitHub Issues 기반) -->
<script src="https://utteranc.es/client.js"
  repo="catcatdo/catcatbuilder"
  issue-term="pathname"
  theme="github-light"
  crossorigin="anonymous"
  async>
</script>
```

## 디자인 참고
- https://news.ycombinator.com (미니멀)
- https://dev.to (카드 UI)
- https://reddit.com (투표 버튼)

## 성공 지표
- 일일 방문자 증가
- 체류 시간 증가
- 뉴스레터 구독자
- SNS 공유 수