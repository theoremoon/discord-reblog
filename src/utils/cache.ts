import NodeCache from 'node-cache';

// デフォルトのTTL（有効期限）を環境変数から取得、なければ5分
const CACHE_TTL = parseInt(process.env.DISCORD_CACHE_TTL || '300', 10);

// キャッシュインスタンスを作成
const messageCache = new NodeCache({
  stdTTL: CACHE_TTL,
  checkperiod: 60, // 60秒ごとに期限切れのキーをチェック
  useClones: true,
});

/**
 * キャッシュからデータを取得する
 */
export function getCachedData<T>(key: string): T | undefined {
  return messageCache.get<T>(key);
}

/**
 * データをキャッシュに保存する
 */
export function setCachedData<T>(key: string, data: T, ttl: number = CACHE_TTL): boolean {
  return messageCache.set(key, data, ttl);
}

/**
 * キャッシュからデータを削除する
 */
export function removeCachedData(key: string): number {
  return messageCache.del(key);
}

/**
 * キャッシュをクリアする
 */
export function clearCache(): void {
  messageCache.flushAll();
}

// エクスポートしてモジュール外から参照できるようにする
export { CACHE_TTL };
