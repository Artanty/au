import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

function encryptText(text, key, isConstant = true) {
  const algorithm = 'aes-256-gcm';
  
  if (isConstant) {
    // For constant encryption, use a fixed IV derived from the key
    const iv = crypto.createHash('sha256').update(key).update('fixed_iv').digest().slice(0, 16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return only encrypted data + auth tag (no IV since it's fixed)
    return encrypted + ':' + authTag.toString('hex');
  } else {
    // For non-constant encryption, use random IV
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return IV + encrypted data + auth tag
    return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
  }
}

function decryptText(encryptedData, key, isConstant = true) {
  const algorithm = 'aes-256-gcm';
  
  if (isConstant) {
    // For constant encryption, use fixed IV and split only encrypted data + auth tag
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format for constant encryption');
    }
    
    const encrypted = parts[0];
    const authTag = Buffer.from(parts[1], 'hex');
    
    // Generate the same fixed IV used for encryption
    const iv = crypto.createHash('sha256').update(key).update('fixed_iv').digest().slice(0, 16);
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } else {
    // For non-constant encryption, split IV + encrypted data + auth tag
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

export const encrypt = (val1, val2, isConstant = true) => {
  const data = `${val1}___${val2}`;
  const key = process.env.CONSTANT_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('CONSTANT_ENCRYPTION_KEY is required');
  }
  
  // Ensure key is 32 bytes for AES-256
  const keyBuffer = Buffer.from(key.padEnd(32).slice(0, 32));
  
  return encryptText(data, keyBuffer, isConstant);
}

export const decrypt = (encryptedData, isConstant = true) => {
  const key = process.env.CONSTANT_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('CONSTANT_ENCRYPTION_KEY is required');
  }
  
  try {
    // Ensure key is 32 bytes for AES-256
    const keyBuffer = Buffer.from(key.padEnd(32).slice(0, 32));
    
    const decrypted = decryptText(encryptedData, keyBuffer, isConstant);
    const [val1, val2] = decrypted.split('___');
    
    if (!val1 || !val2) {
      throw new Error('Invalid encrypted data format');
    }
    
    return [val1, val2];
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}
