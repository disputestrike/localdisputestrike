// Storage helpers for file uploads
// Railway-only: uses fileStorage (disk volume) + /api/files. No manus.

import { fileStorage } from './s3Provider';

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, '');
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  const { fileUrl, fileKey } = await fileStorage.saveFile(key, buffer, contentType);
  return { key: fileKey, url: fileUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, '');
  const url = fileStorage.getPublicUrl(key);
  return { key, url };
}
