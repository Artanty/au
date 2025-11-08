import { promises as fs } from 'fs';
import path from 'path';
import { createShortHash } from './createHash';

import { dd } from './dd';
import { buildFolderPath } from './buildFolderPath';
export interface GetUserDataFileRes {
  exists: boolean,
  data?: any, 
  fileName?: string,
  filePath?: string,
  folderPath?: string
}

export async function getUserDataFileByUserHandler(folder, userHandler): Promise<GetUserDataFileRes> {
  try {
    userHandler = createShortHash(userHandler);
    const folderPath = buildFolderPath(folder);
        
    // Read all files in the directory
    const files = await fs.readdir(folderPath);
    dd('folderPath')
    dd(folderPath)
    dd('userHandler');
    dd(`${userHandler}___`);
    // Look for files that match the pattern: ${userHandler}___*.json
    const matchingFiles = files.filter(file => 
      file.startsWith(`${userHandler}___`) && file.endsWith('.json')
    );
    dd('matchingFiles.length')
    dd(matchingFiles.length)
    if (matchingFiles.length === 0) {
      return { exists: false };
    }
        
    // Get the first matching file (assuming one per userHandler)
    const fileName = matchingFiles[0];
    const filePath = path.join(folderPath, fileName);
    dd('fileName')
    dd(fileName)
    // Read and parse the file content
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
        
    return {
      exists: true,
      data: data,
      fileName: fileName,
      filePath: filePath
    };
        
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Directory doesn't exist
      return { exists: false };
    }
    throw error;
  }
}

export async function getUserDataFileByAccessToken(folder, accessToken): Promise<GetUserDataFileRes> {
  const result: GetUserDataFileRes = {
    exists: false,
    fileName: '',
    filePath: ''
  }
  try {
    accessToken = createShortHash(accessToken);
    result.folderPath = buildFolderPath(folder);
        
    // Read all files in the directory
    const files = await fs.readdir(result.folderPath);
        
    const matchingFiles = files.filter(file => 
      file.endsWith(`___${accessToken}.json`)
    );
        
    if (matchingFiles.length === 0) {
      // return { exists: false };
      
      return result;
    }
        
    // Get the first matching file
    result.fileName = matchingFiles[0];
    result.filePath = path.join(result.folderPath, result.fileName);
        
    // Read and parse the file content
    const fileContent = await fs.readFile(result.filePath, 'utf8');
    const data = JSON.parse(fileContent);
      
    result.exists = true;
    result.data = data;

    return result;
        
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Directory doesn't exist
      return result;
    }
    throw error;
  }
}

export function buildUserDataFileName(userHandler: string, accessToken: string): string {
  userHandler = createShortHash(userHandler);
  accessToken = createShortHash(accessToken);
  const fileName = `${userHandler}___${accessToken}.json`;
  
  return fileName;
}