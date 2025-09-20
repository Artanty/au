const crypto = require('crypto');
import dotenv from 'dotenv';
dotenv.config();

function encryptText(text, key) {
  const cipher = crypto.createCipher('aes-256-gcm', key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptText(encrypted, key) {
  const decipher = crypto.createDecipher('aes-256-gcm', key);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export const encrypt = (val1: string | number, val2: string) => {
  const data = `${val1}___${val2}`;
  const key = process.env.CONSTANT_ENCRYPTION_KEY
  return encryptText(data, key)
}

export const decrypt = (encryptedData: string): { val1: string; val2: string } => {
  const key = process.env.CONSTANT_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('key is required');
  }
  
  try {
    const decrypted = decryptText(encryptedData, key);
    const [val1, val2] = decrypted.split('___');
    
    if (!val1 || !val2) {
      throw new Error('Invalid encrypted data format');
    }
    
    return { val1, val2 };
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}