import path from 'path';
import { promises as fs } from 'fs';

export async function ensureDirExists(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err: unknown) {
    if ((err as any).code !== 'EEXIST') throw err;
  }
}