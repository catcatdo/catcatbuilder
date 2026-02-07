# Cloudflare Worker Setup (GitHub App)

이 문서는 관리자 페이지에서 `posts.json`을 GitHub에 자동 저장하는 Cloudflare Worker 설정 방법입니다.

## 1) GitHub App 만들기
1. GitHub > Settings > Developer settings > GitHub Apps > New GitHub App
2. App 이름 입력
3. Webhook URL은 임시로 아무 값(예: https://example.com) 가능
4. 권한 설정
   - Repository permissions: Contents = Read & write
5. 설치 범위
   - 특정 저장소(이 repo)만 설치
6. App 생성 후 아래 값을 확인
   - App ID
   - Installation ID (App 설치 후 확인)
   - Private Key 생성 (PEM 다운로드)

## 2) Cloudflare Worker 배포
Cloudflare 계정에서 Workers를 활성화하고 `wrangler`로 배포합니다.

1. `worker/wrangler.toml` 확인
   - 기본값은 catcatbuilder 저장소/브랜치로 설정됨
2. Cloudflare 로그인
   - `wrangler login`
3. Worker 환경 변수/시크릿 설정

```
cd worker
wrangler secret put ADMIN_PASSWORD
wrangler secret put GITHUB_APP_ID
wrangler secret put GITHUB_INSTALLATION_ID
wrangler secret put GITHUB_APP_PRIVATE_KEY
```

- `ADMIN_PASSWORD`는 `admin.js`의 관리자 비밀번호와 동일하게 입력
- `GITHUB_APP_PRIVATE_KEY`는 PEM 전체를 그대로 붙여넣기

4. 배포

```
wrangler deploy
```

배포 후 Worker URL이 생성됩니다.

## 3) 관리자 페이지 연결
`admin.js`에서 아래 값을 Worker URL로 변경합니다.

```
const GITHUB_SAVE_ENDPOINT = 'https://<your-worker>.workers.dev/save-posts';
```

## 4) 사용 방법
1. 관리자 로그인
2. 글 작성/수정
3. JSON 탭에서 `GitHub에 저장` 클릭

## 문제 해결
- 401 Unauthorized: `ADMIN_PASSWORD`가 맞는지 확인
- 403/404 GitHub error: App 설치 범위와 권한, Installation ID 확인
- CORS 문제: `worker/wrangler.toml`의 `ALLOWED_ORIGINS` 확인
