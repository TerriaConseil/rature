export type CacheStats = { fileCount: number; totalBytes: number };

export async function getCacheStats(): Promise<CacheStats> {
  if (!('caches' in window)) return { fileCount: 0, totalBytes: 0 };
  const names = await caches.keys();
  let fileCount = 0, totalBytes = 0;
  for (const name of names) {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    fileCount += requests.length;
    for (const req of requests) {
      const res = await cache.match(req);
      if (res) {
        const cl = res.headers.get('content-length');
        if (cl) totalBytes += parseInt(cl, 10);
      }
    }
  }
  return { fileCount, totalBytes };
}

export async function deleteAllCaches(): Promise<void> {
  if (!('caches' in window)) return;
  const names = await caches.keys();
  await Promise.all(names.map(n => caches.delete(n)));
}
