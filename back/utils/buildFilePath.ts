import path from 'path';
import { sanitizePath } from './sanitizePath';
import { STORAGE_ROOT } from '../core/constants';

/**
 * Builds the full file path from path and filename
 */
export function buildFilePath(rawPath: string, fileName: string): string {
	const safePath = sanitizePath(rawPath.toString());
	const safeFileName = sanitizePath(fileName.toString());
	const storageDir = path.join(STORAGE_ROOT, safePath);
	return path.join(storageDir, safeFileName);
}