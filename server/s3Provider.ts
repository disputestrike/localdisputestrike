/**
 * File Storage Provider for DisputeStrike
 * 
 * This implementation uses Railway's persistent volume storage.
 * Files are stored on the server's file system in a persistent volume.
 * 
 * For Railway deployment:
 * 1. Add a volume to your service in Railway dashboard
 * 2. Mount it to /data (or update STORAGE_PATH below)
 * 3. Files will persist across deployments
 */

import * as fs from 'fs';
import * as path from 'path';

// Use Railway volume mount path, fallback to local uploads directory
const STORAGE_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || '/data/uploads';
const BASE_URL = process.env.RAILWAY_PUBLIC_DOMAIN 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : process.env.BASE_URL || 'http://localhost:3000';

// Ensure storage directory exists
function ensureStorageDir(subPath: string = '') {
  const fullPath = path.join(STORAGE_PATH, subPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
}

// Initialize storage on module load
try {
  ensureStorageDir();
  console.log(`[Storage] Initialized at ${STORAGE_PATH}`);
} catch (error) {
  console.warn(`[Storage] Could not initialize storage at ${STORAGE_PATH}, using temp directory`);
}

class FileStorageService {
  /**
   * Save a file to storage and return the URL
   * @param key The file key (path) for the file
   * @param data The file data as Buffer
   * @param contentType The content type of the file
   * @returns The public URL where the file can be accessed
   */
  async saveFile(key: string, data: Buffer, contentType: string): Promise<{ fileUrl: string; fileKey: string }> {
    // Ensure the directory structure exists
    const dirPath = path.dirname(key);
    ensureStorageDir(dirPath);
    
    const fullPath = path.join(STORAGE_PATH, key);
    
    // Write the file
    fs.writeFileSync(fullPath, data);
    
    // Return the URL where the file can be accessed via our API
    const fileUrl = `${BASE_URL}/api/files/${encodeURIComponent(key)}`;
    
    console.log(`[Storage] Saved file: ${key} -> ${fileUrl}`);
    
    return { fileUrl, fileKey: key };
  }

  /**
   * Get a file from storage
   * @param key The file key (path)
   * @returns The file data and content type
   */
  async getFile(key: string): Promise<{ data: Buffer; contentType: string } | null> {
    const fullPath = path.join(STORAGE_PATH, key);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const data = fs.readFileSync(fullPath);
    
    // Determine content type from extension
    const ext = path.extname(key).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    return { data, contentType };
  }

  /**
   * Delete a file from storage
   * @param key The file key (path)
   */
  async deleteFile(key: string): Promise<void> {
    const fullPath = path.join(STORAGE_PATH, key);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`[Storage] Deleted file: ${key}`);
    }
  }

  /**
   * Check if a file exists
   * @param key The file key (path)
   */
  async fileExists(key: string): Promise<boolean> {
    const fullPath = path.join(STORAGE_PATH, key);
    return fs.existsSync(fullPath);
  }

  /**
   * Generate a file key for a user upload
   * @param userId The user ID
   * @param bureau The bureau type
   * @param fileName The original file name
   */
  generateFileKey(userId: number, bureau: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `uploads/${userId}/${bureau}/${timestamp}_${sanitizedFileName}`;
  }

  /**
   * Get the public URL for a file
   * @param key The file key
   */
  getPublicUrl(key: string): string {
    return `${BASE_URL}/api/files/${encodeURIComponent(key)}`;
  }

  /**
   * Get the storage path (for debugging)
   */
  getStoragePath(): string {
    return STORAGE_PATH;
  }
}

export const fileStorage = new FileStorageService();

// Legacy export for backward compatibility
export const s3Provider = {
  async getSignedUploadUrl(key: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
    // For Railway storage, we don't use pre-signed URLs
    // Instead, files are uploaded directly to our server
    const fileUrl = `${BASE_URL}/api/files/${encodeURIComponent(key)}`;
    const uploadUrl = `${BASE_URL}/api/upload`;
    return { uploadUrl, fileUrl };
  },
  getPublicUrl(key: string): string {
    return `${BASE_URL}/api/files/${encodeURIComponent(key)}`;
  },
};
