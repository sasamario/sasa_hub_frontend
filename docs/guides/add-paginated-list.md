# カーソル方式ページング(「さらに読み込む」)の実装パターン

一覧画面で「さらに読み込む」ボタンにより追加データを読み込む機能の実装パターン。
実装例: `app/mocks/githubActivities.ts`(データ取得側) / `app/components/ActivityList.vue`(画面側)。
API設計の考え方自体は `docs/architecture.md` 6.3 を参照。

## 全体の考え方

「ページ番号」ではなく「前回どこまで返したか」という**目印(カーソル)**を使ってページングする方式。

- リクエスト側は、前回のレスポンスでもらった`cursor`をそのまま次のリクエストに渡すだけでよい
  (「何ページ目か」を自分で数える必要がない)。
- サーバー(今回はモック関数)側は、その`cursor`を手がかりに「どこから返せばよいか」を
  逆算する。

## データ取得側(API/モック関数)の実装パターン

### 関数の型

```ts
interface Query {
  cursor?: string | null;
  limit?: number;
  // ...その他の絞り込み条件(期間・フィルタなど)
}

interface Result {
  items: T[];
  nextCursor: string | null; // もう次が無ければnull
}

function getXxxMock(query: Query): Result { ... }
```

### 中身の流れ(`getGithubActivitiesMock`を参照)

1. 絞り込み条件(期間・リポジトリ・種別など)で対象データを絞り込む。
2. 絞り込んだ一覧の中から、`cursor`が指す位置を`findIndex`で**探し出す**。
   - `cursor`は「前回最後に返したデータ」を指す目印であり、「次の開始位置そのもの」ではない。
   - 見つかった位置 + 1 が、今回返す範囲の開始位置(`startIndex`)になる。
   - `cursor`が無ければ`startIndex = 0`(先頭から)。
3. `startIndex`から`limit`件を切り出して`items`とする。
4. 切り出した範囲より後ろにまだデータが残っていれば、**今回返す最後の1件**を
   `nextCursor`として返す(無ければ`null`)。

### カーソル文字列の作り方

一意に位置を特定できる値を組み合わせて文字列化する(例: `activity_date` + `id`)。

```ts
function encodeCursor(item) {
  return `${item.activityDate.toISOString()}_${item.id}`;
}
function decodeCursor(cursor) {
  const [isoDate, idStr] = cursor.split('_');
  return { date: new Date(isoDate), id: Number(idStr) };
}
```

## 画面側(コンポーネント)の実装パターン

### 持つべき状態

```ts
const items = ref<T[]>([]); // 画面に表示する一覧(蓄積されていく)
const cursor = ref<string | null>(null); // 次を読み込むための目印
```

### データ取得関数(初回読み込み・追加読み込み共通)

```ts
function fetchPage(reset: boolean) {
  const result = getXxxMock({
    // 絞り込み条件...
    cursor: reset ? null : cursor.value,
  });

  items.value = reset ? result.items : [...items.value, ...result.items];
  cursor.value = result.nextCursor;
}
```

- `reset: true`: 先頭から取得し直し、`items`を**丸ごと置き換える**。
- `reset: false`: 続きから取得し、`items`の**末尾に追加**する。

### フィルタ・期間が変わったらリセット(`watch`)

```ts
watch(
  [() => props.periodRange, selectedRepository, selectedType],
  () => fetchPage(true),
  { immediate: true },
);
```

- `watch`は、指定した値のどれかが変わるたびにコールバックを実行するVueの仕組み。
- 絞り込み条件が変わった時に**必ずリセット読み込みする**のを忘れると、
  古い条件のデータが混ざって表示され続けるバグになるので注意。
- `immediate: true`を付けないと、初回表示時に何も読み込まれない
  (`watch`はデフォルトでは値が変化した時にしか発火しないため)。

### 「さらに読み込む」ボタン

```ts
function onLoadMoreClick() {
  fetchPage(false);
}
```

```vue
<div v-if="cursor" class="more">
  <button @click="onLoadMoreClick">さらに読み込む</button>
</div>
```

`cursor`が`null`(=もう次が無い)の間はボタンを表示しない。

## 実装時のチェックリスト

- [ ] データ取得関数は`{ items, nextCursor }`の形で返しているか
- [ ] `nextCursor`は「今回最後に返したデータ」を指しているか(次の開始位置そのものではない)
- [ ] 画面側は絞り込み条件が変わったら`fetchPage(true)`でリセットしているか
- [ ] 「さらに読み込む」は`fetchPage(false)`(続きから)を呼んでいるか
- [ ] ボタンの表示条件は`cursor`の有無で判定しているか
