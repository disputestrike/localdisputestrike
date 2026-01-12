// Storage helpers for file uploads
// Uses local file system + CDN upload utility for URLs

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

// Ensure upload directory exists
const UPLOAD_DIR = path.join(os.tmpdir(), 'disputestrike-uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  
  // Create a temporary file
  const fileName = key.split('/').pop() || `file-${Date.now()}`;
  const tempFilePath = path.join(UPLOAD_DIR, fileName);
  
  // Write the data to a temporary file
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  fs.writeFileSync(tempFilePath, buffer);
  
  try {
    // Use manus-upload-file to get a CDN URL
    const { stdout } = await execAsync(`manus-upload-file "${tempFilePath}" 2>&1`);
    
    // Parse the CDN URL from the output
    const urlMatch = stdout.match(/CDN URL: (https:\/\/[^\s]+)/);
    if (!urlMatch) {
      console.error('Upload output:', stdout);
      throw new Error('Failed to get CDN URL from upload');
    }
    
    const url = urlMatch[1];
    console.log(`[STORAGE] Uploaded ${key} -> ${url}`);
    
    return { key, url };
  } catch (error) {
    console.error('[STORAGE] Upload failed:', error);
    throw new Error('Storage upload failed');
  } finally {
    // Clean up temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  // For now, just return the key - actual retrieval would need to be implemented
  // based on how files are stored
  const key = relKey.replace(/^\/+/, "");
  return {
    key,
    url: '', // URL would need to be stored in database
  };
}
