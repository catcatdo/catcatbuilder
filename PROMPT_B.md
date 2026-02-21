# CatCat Builder 홈페이지 개편 - 방안 B: 생산성 허브

## 작업 목표
개발자 + 일반 사용자 모두를 위한 생산성 도구 플랫폼

## 작업 내용

### 1. index.html 개편
```html
- Hero: "모두를 위한 생산성 도구"
- 탭 메뉴: 개발자 도구 | 일상 도구 | 테크 뉴스
- 인기 도우 TOP 5 (클릭 카운트 표시)
- 오늘의 핫한 주제 (실시간 느낌)
- 신규 도구 배지
```

### 2. 도구 페이지 분리
```
developer-tools.html:
- Git 명령어 생성기
- Docker Compose 작성기
- API 테스터
- JWT 디코더

daily-tools.html:
- BMI 계산기
- 환율 변환기
- 단위 변환기
- 날짜 계산기 (D-day)
- 랜덤 숫자 생성기
```

### 3. 사용자 편의 기능
```javascript
- 최근 사용한 도우 (localStorage)
- 즐겨찾기 (별표 표시)
- 검색 기능 (도구 검색)
- 다크/라이트 모드
- PWA 지원 (홈 화면에 추가)
```

### 4. 수익화 준비
```html
<!-- 애드센스 광고 영역 -->
<div class="ad-banner-top">
  <!-- 상단 배너 -->
</div>
<div class="ad-sidebar">
  <!-- 사이드바 광고 -->
</div>
<div class="ad-in-content">
  <!-- 본문 중간 광고 -->
</div>
```

### 5. 디자인 컨셉
```css
- 친근한 색상: Teal (#14B8A6), Orange (#F97316)
- 둥근 모서리 (rounded-2xl)
- 큰 아이콘 (Heroicons)
- 직관적인 레이아웃
- 빠른 로딩 (lazy loading)
```

## 타겟 사용자
- 개발자 (40%)
- 일반 직장인/학생 (60%)

## 완료 체크리스트
- [ ] index.html 리디자인
- [ ] 도구 페이지 분리
- [ ] 즐겨찾기 기능
- [ ] PWA manifest.json
- [ ] 광고 영역 마킹
- [ ] 모바일 최적화
- [ ] GitHub 푸시