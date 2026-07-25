# 環境構築手順(フェーズ0)

Nuxt 4 プロジェクトを Docker 上でゼロから立ち上げた際の手順・判断まとめ。
実務で途中から参画する場合(すでに `package.json` がある場合)は、
基本的に `docker compose build` だけで済むことが多い。
今回は「一から作る」学習目的のため、初期化の手順自体を記録している。

参考: [Nuxt公式 - Installation](https://nuxt.com/docs/4.x/getting-started/installation)

## 用意したファイル

### Dockerfile

```dockerfile
FROM node:22

WORKDIR /app

# node:22に同梱のnpm(10.9.8)にArborist関連の既知バグがあり、
# npm installが `Cannot read properties of null (reading 'edgesOut')` で失敗するため最新化する
RUN npm install -g npm@latest
```

- `FROM node:22`: Nuxt 4 は Node.js 22.x 以上が必須(公式ドキュメントに明記)。
  Dockerイメージのタグは「そのメジャーバージョン内での最新パッチ版」を指すだけで、
  Node.js自体が最新でも同梱されているnpmまで最新とは限らない
  (npmとNode.jsはバージョン管理が別プロジェクト)。
- `WORKDIR /app`: `/app` はNode公式イメージが特別扱いしているディレクトリではなく、
  単なる慣習(通例)。アプリ専用の作業ディレクトリを明示的に切るのが本質で、
  名前自体はどれでもよい。
- `RUN npm install -g npm@latest`: Node同梱npm(10.9.8)に存在するバグを回避するため、
  イメージビルド時にnpm自体を最新化する。一時しのぎでなく恒久対応としてDockerfileに焼き込む。
  npmバージョンを固定したい場合は `npm install -g npm@<version>` や
  Corepack(`packageManager`フィールド)での固定も選択肢になる。

### compose.yml

```yaml
services:
  web:
    build: .
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    command: npm run dev
```

- ファイル名は `docker-compose.yml`(旧来からの慣習)ではなく `compose.yml`
  (Docker Compose V2 の公式推奨名)を採用。動作に差はない。
- `volumes: - .:/app`: ホストとコンテナでファイルを共有(bind mount)。
  ただしファイルが共有されていても `npm install` は**コンテナ内で実行する必要がある**。
  ネイティブ依存を含むパッケージはOS/CPUアーキテクチャに依存してビルドされるため、
  ホスト(Mac)でインストールすると実行環境(Linuxコンテナ)向けにならない。
- `command`: 初期化前は `sleep infinity`(何もせずコンテナを起動させ続けるダミーコマンド。
  `nuxi init`/`npm create nuxt` はまだ存在しない`package.json`に対して実行できないため、
  最初はこの仮の値にしていた)。プロジェクト生成・`npm install`成功後に
  `npm run dev` へ差し替えた。
- `entrypoint.sh` を使う構成もよく見かけるが、それは「起動前にDB待ち・マイグレーション・
  条件分岐など複数ステップの初期化処理を挟みたい場合」に有効な手法。
  今回は `npm run dev` を1つ実行するだけなので、`command:` に直接書くシンプルな形で十分。
  将来DB連携等が発生したら導入を再検討する。

## 実行したコマンド

```bash
# イメージのビルド
docker compose build

# Nuxtプロジェクトの初期化(公式ドキュメント記載の方法。カレントディレクトリに生成)
docker compose run --rm web npm create nuxt@latest .

# 依存関係の再インストール(初期化直後に自動実行されるnpm installが
# 上記npmバグで失敗した場合の手動リトライ)
docker compose run --rm web npm install

# 開発サーバー起動(常駐)
docker compose up
```

- `docker compose run`: `up`と違い、常駐させず**1回限りのコマンド実行**用にコンテナを起動する。
  今回はプロジェクト初期化という1回限りの作業だったため使用。
- `--rm`: 実行後にその使い捨てコンテナを自動削除するオプション。
  bind mountしたファイル(ホスト側の実体)やビルド済みイメージは削除されないため、安全に付けてよい。
- `npx` と `npm` の違い: `npm`はパッケージ管理(インストール・依存関係の記録)、
  `npx`はパッケージのCLIをその場で(必要なら一時ダウンロードして)実行するツール。
  今回は`npm create nuxt@latest`(npmが用意している汎用スキャフォールディング用の
  ショートハンド。内部的に`create-nuxt`相当のパッケージを取得・実行する)を使ったため
  `npx`は使用していない。`npx nuxi@latest init .`という書き方も存在し、
  そちらは`npx`経由で`nuxi`のCLIを直接呼び出す形になるが、最終的な生成物は同じ想定。

## プロジェクト生成時の選択

- **生成コマンド**: `npm create nuxt@latest .` を使用(公式ドキュメント記載の方法)。
  `npx nuxi@latest init .` でも最終的な生成物は同じだが、公式の現行手順に合わせた。
  なお `create-nuxt-app` はNuxt 2時代の旧ツールで非推奨のため使わない。
- **テンプレート**: `minimal`(`app.vue`1枚だけの最小構成)を選択。
  `content`(コンテンツサイト向け)・`module`(Nuxtモジュール開発用)・
  `ui`(Nuxt UI同梱、UIライブラリ方針が未定のため見送り)・`v5-nightly`(対象外)は不採用。
  レイアウトやルーティングを一つずつ組み立てて理解する方針(CLAUDE.md参照)に合わせた。
- **Git初期化の確認**: 「いいえ」を選択。すでに`.git`が存在する既存リポジトリのため、
  Nuxt側で重ねて初期化する必要はない。

## 注意点

- **`.gitignore`の上書き**: プロジェクト生成時、既存の`.gitignore`
  (`.vscode/*`等の設定を含んでいたもの)がNuxt生成のものに**上書きされた**。
  今回は元の内容を復元せず、Nuxt生成のものをそのまま採用する判断とした。
- **npmのバグ**: `Cannot read properties of null (reading 'edgesOut')` は
  npm 10.x系の既知バグ(Arborist関連)。`npm install -g npm@latest`で解消した。
