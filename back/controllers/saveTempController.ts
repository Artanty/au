import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_ROOT = path.join(__dirname, '..', 'storage');

export interface SaveTempReq { // rename to universal, replace somewhere
  path: string // same
  fileName: string
  data: any
}

// Ensure directory exists
async function ensureDirExists(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err: unknown) {
    if ((err as any).code !== 'EEXIST') throw err;
  }
}

// Sanitize path components
export function sanitizePath(input: string) {
  return input
    .replace(/\.\./g, '')        // Remove parent directory references
    .replace(/[^\w\-.%]/g, '_')  // Replace special chars with underscore
    .replace(/\/+/g, '/')        // Collapse multiple slashes
    .replace(/^\/|\/$/g, '');    // Trim leading/trailing slashes
}

/**
 * body:
 * path string
 * fileName string
 * file will be saved to:
 * /${env.SAVE_TEMP_FOLDER}/${path}/${fileName}
 * */
export const saveTemp = async (reqBody) => {
  console.log(reqBody)
  try {
    // 1. Validate request body
    const { path: rawPath, fileName, data } = reqBody as SaveTempReq;
    
    if (!rawPath || !fileName || !data) {
      throw new Error('path, fileName and data are required')
    }

    // 2. Sanitize inputs (treating path as literal string)
    const safePath = sanitizePath(rawPath.toString());
    const safeFileName = sanitizePath(fileName.toString());

    // 3. Build storage path
    const storageDir = path.join(STORAGE_ROOT, safePath);
    const filePath = path.join(storageDir, safeFileName);

    // 4. Ensure directory exists
    await ensureDirExists(storageDir);

    // 6. Write to file
    await fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      'utf8'
    );

    return true

  } catch (error) {
    console.error('Error saving data: ' + error);
    return false
  }
};

/**
 * get data from inner file storage
 * */
export const getUserHandlerAndTokens = async (
  encodedPath: string, 
  filename: string
) => {
  
  const storageDir = path.join(STORAGE_ROOT, encodedPath);
  const filePath = path.join(storageDir, filename);

  try {
    // 1. Check if file exists
    await fs.access(filePath);
    
    // 2. Read file content
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // 3. Compare stringified data
    const currentData = JSON.parse(fileContent);
    
    return currentData
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist
      return false;
    }
    throw error; // Re-throw other errors
  }
}