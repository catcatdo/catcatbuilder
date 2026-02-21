# CatCat Builder 홈페이지 개편 - 방안 A: 개발자 포털

## 작업 목표
개발자 전문 포털 사이트로 리브랜딩

## 작업 내용

### 1. index.html 전면 개편
```html
- Hero 섹션: "개발자를 위한 올인원 포털" 
- 3가지 메인 서비스 카드:
  1. 📚 기술 블로그 (최신 개발 트렌드)
  2. 🛠️ 개발 도구 (유틸리티 모음)  
  3. 💬 커뮤니티 (디시/Reddit 핫한 주제)
- 최신 글 슬라이더 (posts.json 동적 로드)
- 뉴스레터 구독 폼 (이메일 수집)
- GitHub 링크 강조
```

### 2. 디자인 시스템 (styles.css)
```css
- CSS 변수로 다크/라이트 모드
- 모던 카드 UI (그림자, 호버 효과)
- 코드 블럭 Syntax highlighting (Prism.js)
- 반응형 그리드 (모바일 퍼스트)
- 애니메이션 (fade-in, slide-up)
```

### 3. 새 페이지 생성
```
tools.html:
- Docker 명령어 생성기
- GitHub Actions YAML 생성기
- JSON 포맷터/Validator
- Base64 인코더/디코더
- 정규식 테스터

community.html:
- 디시인사이드 실시간 핫한 주제
- Reddit r/programming 인기 글
- 댓글/반응 요약

newsletter.html:
- 주간 뉴스레터 아카이브
- 구독자 통계 (간단히)
```

### 4. JavaScript 기능 (app.js)
```javascript
- 검색 기능 (posts.json 필터링)
- 테마 토글 (localStorage 저장)
- 무한 스크롤 (IntersectionObserver)
- 클립보드 복사 기능
- 공유 버튼 (Web Share API)
```

### 5. SEO 최적화
```html
- Schema.org Article 마크업
- Open Graph 동적 메타 태그
- sitemap.xml 자동 생성 스크립트
- robots.txt 최적화
- Canonical URL 설정
```

## 컬러 팔레트
```
Primary: #2563EB (블루)
Secondary: #10B981 (그린)
Dark: #1F2937 (다크 그레이)
Light: #F9FAFB (라이트 그레이)
Accent: #F59E0B (오렌지)
```

## 완료 후 작업
```bash
git add -A
git commit -m "홈페이지 개편: 개발자 포털 방향"
git push origin main
```

## 참고 사이트
- https://dev.to (커뮤니티 느낌)
- https://github.com/explore (카드 UI)
- https://stackoverflow.com (깔끔한 디자인)