// user名/repository名から、repository名のみ取得
export function getRepositoryShortName(repository: string): string {
  return repository.split('/').at(-1) ?? repository;
}
