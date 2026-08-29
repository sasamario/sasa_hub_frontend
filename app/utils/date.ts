export function toJstDateString(date: Date): string {
  // 日本時間に変換後、YYYY-MM-DD形式にする
  return date
    .toLocaleDateString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replaceAll('/', '-');
}
