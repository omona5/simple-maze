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

## GitHub Pages 자동 배포

호스팅은 GitHub Pages, 도메인 DNS는 Cloudflare를 사용합니다. Cloudflare Pages 프로젝트는 필요하지 않습니다.

`.github/workflows/check.yml`은 `main` 푸시 시 테스트 → 정적 빌드 → GitHub Pages 배포를 수행합니다. PR에서는 테스트와 빌드만 실행합니다. 별도 배포 토큰이나 저장소 시크릿은 필요하지 않습니다.

저장소 **Settings → Pages → Build and deployment → Source**는 **GitHub Actions**로 설정합니다. **Custom domain**에는 `maze.omona.dev`를 등록합니다. `public/CNAME`에도 같은 도메인이 포함되어 있으며, Actions 배포에서는 저장소 Pages 설정에도 도메인을 등록해야 합니다.

`dist/`를 배포하며, 상대 경로로 자산을 참조하므로 GitHub Pages 프로젝트 경로와 커스텀 도메인 모두 지원합니다. `public/.nojekyll`은 정적 파일을 그대로 서비스할 수 있도록 포함했습니다.

## Cloudflare DNS 설정 (사용자)

`omona.dev`의 DNS 관리에서 다음 레코드를 추가합니다.

- Type: **CNAME**
- Name: **maze**
- Target: **omona5.github.io**
- Proxy status: **DNS only** (회색 구름, 최초 인증서 발급 및 연결 확인용)
- TTL: **Auto**

대상에는 `https://` 또는 `/simple-maze`를 붙이지 않습니다. 기존 `maze` 레코드가 있으면 중복되지 않도록 수정합니다.

DNS 반영 후 GitHub 저장소 **Settings → Pages**에서 도메인 확인이 완료되고 인증서가 발급되면 **Enforce HTTPS**를 켭니다. 인증서 발급에는 시간이 걸릴 수 있습니다. 이후 https://maze.omona.dev 에서 게임을 이용할 수 있습니다.

커스텀 도메인이 설정된 동안 기본 https://omona5.github.io/simple-maze/ 주소는 커스텀 도메인으로 리디렉션될 수 있으므로 DNS 연결 전에는 최종 주소 접속이 실패할 수 있습니다.

공식 문서: [GitHub Pages Actions 배포](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [커스텀 도메인 연결](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
