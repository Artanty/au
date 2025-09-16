// import { promises as fs } from 'fs';
// import path from 'path';

// const STORAGE_ROOT = path.join(__dirname, '..', 'storage');

// export interface SaveTempReq { // rename to universal, replace somewhere
//   path: string // same
//   fileName: string
//   data: any
// }

// // Ensure directory exists
// async function ensureDirExists(dirPath: string) {
//   try {
//     await fs.mkdir(dirPath, { recursive: true });
//   } catch (err: unknown) {
//     if ((err as any).code !== 'EEXIST') throw err;
//   }
// }

// // Sanitize path components
// export function sanitizePath(input: string) {
//   return input
//     .replace(/\.\./g, '')        // Remove parent directory references
//     .replace(/[^\w\-.%]/g, '_')  // Replace special chars with underscore
//     .replace(/\/+/g, '/')        // Collapse multiple slashes
//     .replace(/^\/|\/$/g, '');    // Trim leading/trailing slashes
// }

// /**
//  * body:
//  * path string
//  * fileName string
//  * file will be saved to:
//  * /${env.SAVE_TEMP_FOLDER}/${path}/${fileName}
//  * */
// export const saveTemp = async (reqBody: SaveTempReq) => {
//   // console.log(reqBody)
//   try {
//     // 1. Validate request body
//     const { path: rawPath, fileName, data } = reqBody;
    
//     if (!rawPath || !fileName || !data) {
//       throw new Error('path, fileName and data are required')
//     }

//     // 2. Sanitize inputs (treating path as literal string)
//     const safePath = sanitizePath(rawPath.toString());
//     const safeFileName = sanitizePath(fileName.toString());

//     // 3. Build storage path
//     const storageDir = path.join(STORAGE_ROOT, safePath);
//     const filePath = path.join(storageDir, safeFileName);

//     // 4. Ensure directory exists
//     await ensureDirExists(storageDir);

//     // 6. Write to file
//     await fs.writeFile(
//       filePath,
//       JSON.stringify(data, null, 2),
//       'utf8'
//     );

//     return true

//   } catch (error) {
//     console.error('Error saving data: ' + error);
//     return false
//   }
// };

// /**
//  * get data from inner file storage
//  * todo: rename
//  * */
// export const getUserHandlerAndTokens = async (
//   encodedPath: string, 
//   filename: string
// ) => {
  
//   const storageDir = path.join(STORAGE_ROOT, encodedPath);
//   const filePath = path.join(storageDir, filename);

//   try {
//     // 1. Check if file exists
//     await fs.access(filePath);
    
//     // 2. Read file content
//     const fileContent = await fs.readFile(filePath, 'utf8');
    
//     // 3. Compare stringified data
//     const currentData = JSON.parse(fileContent);
    
//     return currentData
//   } catch (error: any) {
//     // if (error.code === 'ENOENT') {
//     //   // File doesn't exist
//     //   return false;
//     // }
//     throw error; // Re-throw other errors
//   }
// }
import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_ROOT = path.join(__dirname, '..', 'storage');

export interface SaveTempReq {
  path: string;
  fileName: string;
  data: any;
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
 * Builds the full file path from path and filename
 */
export function buildFilePath(rawPath: string, fileName: string): string {
  const safePath = sanitizePath(rawPath.toString());
  const safeFileName = sanitizePath(fileName.toString());
  const storageDir = path.join(STORAGE_ROOT, safePath);
  return path.join(storageDir, safeFileName);
}

/**
 * Save data to temporary file
 */
export const saveTemp = async (reqBody: SaveTempReq): Promise<boolean> => {
  try {
    // 1. Validate request body
    const { path: rawPath, fileName, data } = reqBody;
    
    if (!rawPath || !fileName || !data) {
      throw new Error('path, fileName and data are required');
    }

    // 2. Build storage path
    const filePath = buildFilePath(rawPath, fileName);
    const storageDir = path.dirname(filePath);

    // 3. Ensure directory exists
    await ensureDirExists(storageDir);

    // 4. Write to file
    await fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      'utf8'
    );

    return true;

  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (rawPath: string, fileName: string): Promise<boolean> => {
  try {
    // 1. Validate inputs
    if (!rawPath || !fileName) {
      throw new Error('path and fileName are required');
    }

    // 2. Build file path
    const filePath = buildFilePath(rawPath, fileName);

    // 3. Check if file exists
    try {
      await fs.access(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('File does not exist, nothing to delete:', filePath);
        return true; // File doesn't exist, consider it "deleted"
      }
      throw error;
    }

    // 4. Delete the file
    await fs.unlink(filePath);
    console.log('File deleted successfully:', filePath);
    
    return true;

  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Delete entire directory and its contents recursively
 */
export const deleteDirectory = async (rawPath: string): Promise<boolean> => {
  try {
    // 1. Validate input
    if (!rawPath) {
      throw new Error('path is required');
    }

    // 2. Build directory path
    const safePath = sanitizePath(rawPath.toString());
    const dirPath = path.join(STORAGE_ROOT, safePath);

    // 3. Check if directory exists
    try {
      await fs.access(dirPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('Directory does not exist, nothing to delete:', dirPath);
        return true; // Directory doesn't exist, consider it "deleted"
      }
      throw error;
    }

    // 4. Delete directory recursively
    await fs.rm(dirPath, { recursive: true, force: true });
    console.log('Directory deleted successfully:', dirPath);
    
    return true;

  } catch (error) {
    console.error('Error deleting directory:', error);
    return false;
  }
};

/**
 * Check if file exists
 */
export const fileExists = async (rawPath: string, fileName: string): Promise<boolean> => {
  try {
    const filePath = buildFilePath(rawPath, fileName);
    await fs.access(filePath);
    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
};

/**
 * Get data from file storage
 */
export const getUserHandlerAndTokens = async (
  encodedPath: string, 
  filename: string
): Promise<any> => {
  const filePath = buildFilePath(encodedPath, filename);

  try {
    // 1. Check if file exists
    await fs.access(filePath);
    
    // 2. Read file content
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // 3. Parse JSON data
    const currentData = JSON.parse(fileContent);
    
    return currentData;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null; // File doesn't exist
    }
    throw error; // Re-throw other errors
  }
};

/**
 * List files in a directory
 */
export const listFiles = async (rawPath: string): Promise<string[]> => {
  try {
    const safePath = sanitizePath(rawPath.toString());
    const dirPath = path.join(STORAGE_ROOT, safePath);
    
    try {
      await fs.access(dirPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return []; // Directory doesn't exist
      }
      throw error;
    }
    
    return await fs.readdir(dirPath);
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};