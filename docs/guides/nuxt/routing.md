# ルーティング(pages / layouts)

Nuxtの「ファイルベースルーティング」と、共通レイアウトの仕組みについてまとめる。

参考:
- [Nuxt公式 - pages/](https://nuxt.com/docs/4.x/guide/directory-structure/pages)
- [Nuxt公式 - layouts/](https://nuxt.com/docs/4.x/guide/directory-structure/layouts)

## `pages/` ディレクトリ(ファイルベースルーティング)

`pages/` ディレクトリにVueコンポーネントを置くと、**ファイル名がそのままURLになる**。
自分でルーティング設定(パスとコンポーネントの対応表など)を書く必要はない。

| ファイル | 対応するURL |
|---|---|
| `pages/index.vue` | `/` |
| `pages/github.vue` | `/github` |

## `app.vue` と `<NuxtPage />`

`app.vue` は、どのURLでも最初に読み込まれる大元のコンポーネント。
`<NuxtPage />` は、「現在のURLに対応する`pages/`配下のコンポーネントをここに描画する」という
差し込み口の役割を持つ。`app.vue`にこれを置かないと、`pages/`を作ってもページが切り替わらない。

```vue
<!-- app.vue -->
<template>
  <NuxtPage />
</template>
```

## `layouts/` ディレクトリと `<NuxtLayout>`

`layouts/` ディレクトリに置いたコンポーネントは、ページの外側に被せる共通の枠(今回で言う
左サイドメニュー+右メインエリア)として使える。`layouts/default.vue` という名前にすると、
**特に指定しない限り自動的に既定のレイアウトとして適用**される。

- レイアウト側は `<slot />` を用意し、そこに各ページの内容(`<NuxtPage />`の中身)が挿入される。
- `app.vue`側で`<NuxtLayout>`と`<NuxtPage />`を組み合わせることで、
  「共通の外枠(レイアウト) + 中身は現在のページ」という構造になる。

`<slot />` はVueの「コンテンツ差し込み」の仕組み。あるコンポーネントが`<slot />`という穴を
用意しておくと、そのコンポーネントを使う側がタグの間に書いた内容が、そのままその穴に差し込まれる。
`<NuxtLayout>ここ</NuxtLayout>`の「ここ」(=`<NuxtPage />`)が、レイアウト側の`<slot />`の
位置に挿入される、という関係。

```vue
<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

```vue
<!-- layouts/default.vue -->
<template>
  <div class="app-layout">
    <aside><!-- サイドメニュー --></aside>
    <main>
      <slot />
    </main>
  </div>
</template>
```

## 現在地のハイライト

`<NuxtLink>` はNuxt版の`<a>`タグで、クリックしてもページ全体を再読み込みせずに遷移する
(SPA的な画面遷移)。現在表示中のページへのリンクには、Nuxtが自動的に
`router-link-active` / `router-link-exact-active` というCSSクラスを付与するため、
これを使ってハイライト用のスタイルを当てられる(JS側で自分で判定するコードを書かなくてよい)。
