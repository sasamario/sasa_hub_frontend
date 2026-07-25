# runtimeConfig(環境変数の扱い)

Nuxtアプリから環境変数(バックエンドAPIのベースURLなど)を安全に参照するための仕組み。

## 基本的な考え方

- **`nuxt.config.ts`**: 設定項目の**定義・デフォルト値**を書く場所。コードの一部としてGit管理される。
- **`.env`**: 実際の**値**を書く場所。環境(人・マシン)ごとに違う値になり得るため`.gitignore`対象。
- Nuxt起動時に、`.env`に対応する環境変数があれば、`nuxt.config.ts`で定義したデフォルト値を
  **自動的に上書き**する。逆に言うと、**`.env`側だけ値を用意しても、`nuxt.config.ts`側に
  対応するキーが定義されていなければ反映されない**(一方向の上書きの仕組みのため)。

## `public` と それ以外(private)の違い

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    // ここに書いた項目は「private」= サーバーサイドのみで参照可能(ブラウザに漏れない)
    apiSecret: '',
    public: {
      // ここに書いた項目は「public」= クライアント(ブラウザ)側からも参照可能
      apiBaseUrl: '',
    },
  },
});
```

- 画面(クライアント側のコード)から参照したい値は `public` 配下に書く。
- 秘密情報(APIキーなど、ブラウザに渡してはいけない値)は `public` の外(トップレベル)に書く。
  この値はサーバーサイドの処理(APIルートなど)からのみ参照できる。

## 環境変数名の命名規則

`runtimeConfig`のキーから対応する環境変数名への変換ルール:

1. 先頭に `NUXT_` を付ける
2. `public`配下の項目は、続けて `PUBLIC_` を付ける(`public`外の項目は付けない)
3. キー名(キャメルケース)を、大文字スネークケースに変換する

| `nuxt.config.ts` のキー | 対応する環境変数名 |
|---|---|
| `runtimeConfig.public.apiBaseUrl` | `NUXT_PUBLIC_API_BASE_URL` |
| `runtimeConfig.apiSecret`(public外) | `NUXT_API_SECRET` |

## コード側での参照方法

```ts
const config = useRuntimeConfig();
config.public.apiBaseUrl; // クライアント・サーバー両方から参照可能
config.apiSecret; // サーバーサイドのコードからのみ参照可能
```

## Docker環境での注意点

- `docker compose` はプロジェクト直下の `.env` を自動で読み込むが、それは
  **`compose.yml`内での変数展開(`${VAR}`)のためだけ**であり、コンテナ内で動くプロセスの
  環境変数には自動で渡らない。
- コンテナ内のNuxtプロセスに環境変数を渡したい場合は、`compose.yml`のサービス定義に
  `env_file: - .env` を明示的に指定する必要がある。

```yaml
services:
  web:
    env_file:
      - .env
```

## `.env.example` の運用

- `.env` 自体は `.gitignore` 対象(個人・環境ごとの値のため)。
- 「どんな環境変数が必要か」をチームに伝えるため、`.env.example` を用意してコミットする。
- 各項目には、何の値かが分かるようコメントを付ける。

```
# バックエンドAPIの接続先ベースURL
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001
```
