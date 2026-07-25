# 環境構築手順(フェーズ1)

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
      - '3000:3000'
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

## Lint / Formatter の設定

参考: [@nuxt/eslint公式ドキュメント](https://eslint.nuxt.com/packages/module)

### 構成の判断

- ESLint(コード品質チェック)とPrettier(フォーマット)は役割が異なるため、
  **両方導入**することにした。
- 一般的にESLintとPrettierは「フォーマット系ルールが競合する」と言われることが多いが、
  `@nuxt/eslint` は**デフォルトではstylistic(フォーマット関連)ルールを有効化しない**仕様であり、
  今回はそもそも競合しない(`eslint-config-prettier`のような追加調整も不要)。
  ESLint側でフォーマットも管理したい場合のみ、`nuxt.config.ts`で
  `eslint: { config: { stylistic: true } }` を指定する(今回は指定していない)。
- Prettierは実務で広く使われているため、後から導入するとコード量が増えた分だけ
  一括フォーマットの差分が大きくなる。導入するなら早い段階(今回のようにコードがほぼ空の時点)が
  コストが低い。

### 実行したコマンド

```bash
docker compose up            # ターミナルA: 開発サーバーを起動したままにする
docker compose exec web bash # ターミナルB: 起動中のコンテナに入って作業する

# コンテナ内
npx nuxt module add eslint   # @nuxt/eslintの追加(package.json依存追加 + nuxt.config.ts自動編集)
npm install -D prettier
```

- `docker compose run --rm` と `docker compose exec` の違い:
  `run`は**新しい使い捨てコンテナ**を作って1回限りのコマンドを実行する。
  `exec`は**すでに起動中のコンテナ**の中に入って作業する。
  複数コマンドを連続で試す作業は`exec`で中に入った方が効率的。
- `npx nuxt module add eslint` の `npx nuxt`: プロジェクト作成時の`npm create nuxt@latest`
  (この時点では`nuxt`パッケージ自体がまだ存在しないため一時取得していた)とは異なり、
  今回は`package.json`にすでに`nuxt`パッケージがインストール済みのため、
  `npx`は新規取得ではなく**ローカルにインストール済みの`nuxt`コマンド**を実行する。
  `eslint.config.mjs`(ESLint設定ファイル)は、コマンド実行時点ではなく
  **その後開発サーバーを起動したタイミングで自動生成**される。

### 用意したファイル

**`prettier.config.js`**(`package.json`の`"type": "module"`指定により`export default`形式)

```js
export default {
  semi: true, // 文末にセミコロンを付ける(Prettierデフォルトと同じだが明示)
  singleQuote: true, // 文字列はシングルクォートに統一
  trailingComma: 'all', // 配列・オブジェクトの末尾にもカンマ(差分を最小化)
  printWidth: 80, // 1行の最大文字数
  tabWidth: 2, // インデント幅
};
```

- Prettierの設定ファイル名は複数選べる(`.prettierrc`(JSON) / `.prettierrc.json` /
  `.prettierrc.yml` / `.prettierrc.js` / `.prettierrc.cjs` / `prettier.config.js` /
  `prettier.config.cjs` など)。**コメントを書きたい場合はJSON系ではなくJS系を選ぶ**必要がある
  (JSONの仕様上コメントが書けないため)。今回はコメントを残したかったので
  `prettier.config.js`を採用した。

**`.prettierignore`**

```
.nuxt
.output
.data
node_modules
dist
```

- `.gitignore`と書き方(構文)は同じで、対象がGit管理ではなく
  **Prettierによるフォーマット対象からの除外**という違いだけ。
  ビルド生成物・依存パッケージなど「自分たちで書いていないコード」を除外している。

**`.vscode/settings.json`**(保存時に自動フォーマット)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

- `.vue`ファイルは、VSCodeのVue関連拡張機能が独自にデフォルトフォーマッターとして
  登録している場合があり、それが全体設定(`editor.defaultFormatter`)より優先されてしまうことがある。
  VSCodeは**言語ごとの個別設定(`"[言語ID]"`)が全体設定より優先される**仕様のため、
  `.vue`用に明示的に上書きする必要があった。
- 設定変更後は、VSCodeのウィンドウリロード(`Cmd+Shift+P` → `Reload Window`)が必要な場合がある。
- `.vscode`はこのプロジェクトの`.gitignore`では除外していないため、
  このままコミットしてチーム(自分自身も含め将来の環境)で設定を共有する運用とした。

### 注意点

- **保存時フォーマットとコマンド実行(`npm run format`)の使い分け**:
  VSCode上で編集する限り保存時フォーマットで完結し、コマンドの出番は普段ほぼ無い。
  ただし以下のケースのため、コマンド自体は残しておく価値がある。
  - Claude Codeなどエディタを介さない(保存イベントが発生しない)経路でのファイル編集
  - 将来CIを導入した際の`prettier --check`によるフォーマット崩れの検知
  - 既存コード全体への一括フォーマット
- **Vueテンプレート内のクォートは変換されない**: `<template>`内の地の文(表示テキスト)は
  JS/TSの文字列リテラルではなくHTML的なテキストとして扱われるため、
  `singleQuote`設定の対象外(そのため一見「効いていない」ように見えることがある)。
  `<script setup>`内のJS文字列であれば通常通り変換される。
- **設計書(docs/配下のMarkdown)へのフォーマット適用**: `npm run format`実行により
  Markdownのテーブル列幅が統一される等の変更が入る。内容(文章)自体は変わらない安全な整形だが、
  Prettierは列幅を文字数基準で計算するため、日本語混じりのテーブルは
  生テキスト上では厳密には揃って見えないことがある(レンダリング後の見た目には影響しない)。
  今回は対象から除外せず、そのまま適用する運用とした。

## APIベースURLの環境変数化

Nuxtの `runtimeConfig` を使って、バックエンドAPIのベースURLを環境変数から読み込めるようにした。
仕組みの詳細(命名規則・public/privateの違いなど)は `docs/guides/nuxt/runtime-config.md` を参照。

### 用意したファイル

**`nuxt.config.ts`**(抜粋)

```ts
runtimeConfig: {
  public: {
    // .envの NUXT_PUBLIC_API_BASE_URL で上書きされる。ここはデフォルト値(未設定時のフォールバック)
    apiBaseUrl: '',
  },
},
```

**`.env`** / **`.env.example`**

```
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

- バックエンドは別リポジトリで未着手のため、ポート番号は仮の値。実際の値が決まったら差し替える。
- `.env.example` にはコメントで用途を記載する運用とした。

**`compose.yml`**(`env_file`を追加)

```yaml
services:
  web:
    env_file:
      - .env
```

- `docker compose` はプロジェクト直下の `.env` を自動で読み込むが、それは
  `compose.yml`内の変数展開(`${VAR}`)のためだけで、コンテナ内プロセスの環境変数には
  自動で渡らない。コンテナ内で動く Nuxt に値を渡すには `env_file` の明示指定が必要だった。
