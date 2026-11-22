# simple maze

작은 미로, 잠깐의 몰입. 모바일 스와이프와 PC 방향키로 즐기는 미로 찾기 게임입니다.

목표 주소: **https://maze.omona.dev** (Cloudflare 연결 후 사용 가능)

## 게임

- 매번 새로 생성하는 미로: 9×9, 15×15, 21×21
- 모바일: 미로 위에서 스와이프. 길게 밀면 여러 칸 이동하며, 방향 버튼도 사용할 수 있습니다.
- PC: 방향키 또는 WASD. 미로를 클릭하면 키보드 조작에 초점이 맞춰집니다.
- 지나온 경로, 길 힌트, 처음부터 다시 시작, 완주 결과
- 난이도별 최고 시간은 현재 브라우저에 저장합니다. 힌트를 사용한 판은 기록에서 제외합니다.
- 다른 탭으로 이동하면 시간이 일시 정지됩니다.

## 로컬 실행

Node.js 22 이상. 외부 패키지 설치 없이 실행합니다.

```sh
npm run dev
```

http://127.0.0.1:5173 접속.

```sh
npm test
npm run build
```

빌드 결과는 `dist/`입니다. 게임 실행에는 별도 서버나 데이터베이스가 필요하지 않습니다. 웹 폰트를 불러올 수 없는 환경에서는 시스템 글꼴로 표시합니다.

## Cloudflare Pages 배포 (최초 1회)

1. Cloudflare 대시보드 → **Workers & Pages** → **Create application** → **Pages** → **Import an existing Git repository**.
2. GitHub를 연결하고 **omona5/simple-maze** 저장소를 선택합니다. GitHub 권한 요청이 나타나면 해당 저장소 접근을 허용합니다.
3. 다음 설정으로 배포합니다.
   - Project name: `simple-maze` (이미 사용 중이면 다른 이름)
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: 비워두기 (저장소 루트)
   - Environment variable: `NODE_VERSION` = `22`
4. **Save and Deploy**를 누릅니다. 발급된 `*.pages.dev` 주소에서 게임을 확인합니다.

Git 연동이 완료되면 `main`에 푸시할 때 자동으로 재배포됩니다. API 토큰이나 GitHub Actions 배포 시크릿은 필요하지 않습니다. `Verify game` 워크플로는 테스트와 빌드만 확인합니다.

## maze.omona.dev 연결

1. 배포한 Pages 프로젝트 → **Custom domains** → **Set up a custom domain**.
2. `maze.omona.dev`를 입력하고 안내대로 활성화합니다.
3. `omona.dev` DNS가 같은 Cloudflare 계정에 있다면 제시되는 DNS 레코드 추가를 승인합니다.
4. 외부 DNS를 사용 중이라면 Cloudflare가 안내하는 대상(실제 발급된 `<프로젝트>.pages.dev`)으로 `maze` CNAME 레코드를 추가합니다. 기존 `maze` 레코드가 있으면 충돌 여부를 확인합니다.
5. 도메인 상태가 **Active**가 되고 인증서가 발급된 뒤 https://maze.omona.dev 로 접속합니다.

**DNS 레코드만 먼저 만들지 말고 Pages의 Custom domains에 도메인을 반드시 등록하세요.** 실제 대상 호스트는 프로젝트 이름에 따라 달라집니다.

공식 문서: [정적 사이트 배포](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [빌드 설정](https://developers.cloudflare.com/pages/configuration/build-configuration/), [커스텀 도메인](https://developers.cloudflare.com/pages/configuration/custom-domains/).
