import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/** Root that /api/admin/upload writes into; kept configurable for persistent volumes. */
export function uploadRoot() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
}

/**
 * Write an image buffer into the uploads tree and return its public path.
 * `extension` must be a fixed literal like '.jpg' — never anything derived from a
 * remote filename, or a crafted name could escape the folder.
 */
export async function storeImage(buffer, extension, folder = 'products') {
  const safeFolder = String(folder || 'products').replace(/[^a-zA-Z0-9_-]/g, '') || 'products';
  const dir = path.join(uploadRoot(), safeFolder);
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${safeFolder}/${filename}`;
}
