# 종합 유틸리티 포털

다양한 실용 도구, 인터랙티브 위젯, 미니게임을 제공하는 종합 포털 사이트입니다.

## 주요 기능

### 실용 도구
- **BMI 계산기**: 키와 몸무게를 입력하여 BMI 지수와 건강 상태를 확인
- **환율 변환기**: 주요 통화 간 실시간 환율 변환
- **할일 목록**: 브라우저 LocalStorage 기반 To-Do List

### 인터랙티브 위젯
- **날씨 위젯**: 도시명으로 현재 날씨 정보 조회
- **암호화폐 시세**: 주요 암호화폐의 실시간 가격 정보
- **랜덤 명언**: 영감을 주는 명언 생성

### 미니 게임
- **숫자 맞추기**: 1-100 사이의 숫자를 맞추는 게임
- **가위바위보**: 컴퓨터와 대결하는 게임
- **색상 팔레트 생성기**: 랜덤 색상 팔레트 생성 및 복사

## 사용된 API

모든 API는 무료이며 API 키가 필요하지 않습니다:

- **환율**: [ExchangeRate-API](https://www.exchangerate-api.com/)
- **암호화폐**: [CoinGecko API](https://www.coingecko.com/en/api)
- **명언**: [Quotable API](https://api.quotable.io/)
- **날씨**: [wttr.in](https://wttr.in/)

## 기술 스택

- HTML5
- CSS3 (Flexbox, Grid, Responsive Design)
- Vanilla JavaScript (ES6+)
- LocalStorage API
- Fetch API

## 로컬 실행 방법

1. 저장소 클론:
```bash
git clone https://github.com/catcatdo/catcatbuilder.git
cd catcatbuilder
```

2. 브라우저에서 `index.html` 파일을 직접 열기

또는 로컬 서버 실행:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server
```

3. 브라우저에서 `http://localhost:8000` 접속

## GitHub Pages 배포

### 자동 배포 (권장)

1. GitHub 저장소 Settings → Pages로 이동
2. Source를 `main` 브랜치로 설정
3. 저장 후 몇 분 대기

또는 gh CLI 사용:
```bash
gh repo edit --enable-pages --pages-branch main
```

### 수동 배포

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

배포 URL: `https://<username>.github.io/<repository-name>`

## 파일 구조

```
catcatbuilder/
├── index.html          # 메인 HTML 파일
├── styles.css          # 전체 스타일시트
├── app.js              # 모든 JavaScript 기능
└── README.md           # 프로젝트 문서
```

## 브라우저 지원

- Chrome (권장)
- Firefox
- Safari
- Edge

모던 브라우저의 최신 버전을 권장합니다.

## 기능 상세

### BMI 계산기
- 키(cm)와 몸무게(kg) 입력
- BMI 계산 및 저체중/정상/과체중/비만 분류
- 즉각적인 결과 표시

### 환율 변환기
- 5개 주요 통화 지원 (USD, EUR, JPY, GBP, KRW)
- 실시간 환율 정보
- 자동 계산 및 결과 표시

### 할일 목록
- 할일 추가/삭제
- 완료 체크 기능
- LocalStorage 자동 저장 (새로고침 후에도 유지)

### 날씨 위젯
- 도시명으로 검색
- 온도, 날씨 상태, 습도, 풍속 표시
- 전 세계 주요 도시 지원

### 암호화폐 시세
- Bitcoin, Ethereum, Ripple, Cardano, Dogecoin 지원
- 실시간 USD 가격 표시
- 버튼 클릭으로 즉시 업데이트

### 랜덤 명언
- 영어 명언 제공
- 저자 정보 포함
- 무한 생성 가능

### 숫자 맞추기 게임
- 1-100 범위의 랜덤 숫자
- 힌트 제공 (더 크다/작다)
- 시도 횟수 기록
- 새 게임 시작 기능

### 가위바위보 게임
- 컴퓨터와 대결
- 승/무/패 통계 기록
- 즉각적인 결과 표시

### 색상 팔레트 생성기
- 5개의 랜덤 색상 생성
- HEX 코드 표시
- 클릭으로 클립보드 복사

## 반응형 디자인

모든 화면 크기에 최적화:
- 데스크톱 (1200px+)
- 태블릿 (768px - 1024px)
- 모바일 (360px - 768px)

## 성능 최적화

- API 결과 캐싱
- 로딩 스피너 표시
- 에러 핸들링
- 최소한의 외부 의존성

## 광고 통합

Google AdSense 통합을 위한 영역이 준비되어 있습니다:
- 상단 가로 광고 (728x90 또는 반응형)
- 사이드바 광고 2개 (300x250, 300x600)

광고 코드를 `index.html`의 해당 영역에 삽입하세요.

## 라이선스

MIT License

## 기여

버그 리포트, 기능 제안, Pull Request를 환영합니다.

## 개발자

GitHub: [@catcatdo](https://github.com/catcatdo)

## 업데이트 내역

### v1.0.0 (2026-01-30)
- 초기 릴리스
- 9개의 도구/위젯/게임 구현
- 완전한 반응형 디자인
- GitHub Pages 배포 준비 완료
