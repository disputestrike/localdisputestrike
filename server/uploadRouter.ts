import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";
import { sanitizeFileName } from "./inputValidation";

// Allowed file types for security
const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/html',
  'text/plain',
] as const;

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Router for file upload operations
 * Includes security validations for file type and size
 */
export const uploadRouter = router({
  /**
   * Upload file to S3 with security validation
   */
  uploadToS3: protectedProcedure
    .input(z.object({
      fileKey: z.string()
        .max(255, 'File name too long')
        .transform(sanitizeFileName),
      fileData: z.array(z.number())
        .max(MAX_FILE_SIZE, 'File too large (max 50MB)'),
      contentType: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/html', 'text/plain']),
    }))
    .mutation(async ({ input, ctx }) => {
      const { fileKey, fileData, contentType } = input;
      
      // Security: Log upload attempt
      console.log(`[UPLOAD] User ${ctx.user?.id} uploading ${contentType} file: ${fileKey}`);
      
      // Security: Validate file size
      if (fileData.length > MAX_FILE_SIZE) {
        throw new Error('File too large');
      }
      
      // Security: Validate content type matches file extension
      const extension = fileKey.split('.').pop()?.toLowerCase();
      const validExtensions: Record<string, string[]> = {
        'application/pdf': ['pdf'],
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/gif': ['gif'],
        'text/html': ['html', 'htm'],
        'text/plain': ['txt'],
      };
      
      if (extension && validExtensions[contentType] && !validExtensions[contentType].includes(extension)) {
        console.warn(`[SECURITY] Content type mismatch: ${contentType} vs .${extension}`);
        throw new Error('File extension does not match content type');
      }
      
      // Convert number array back to Buffer
      const buffer = Buffer.from(fileData);
      
      // Upload to S3
      const result = await storagePut(fileKey, buffer, contentType);
      
      console.log(`[UPLOAD] Success: ${fileKey}`);
      
      return {
        url: result.url,
        key: fileKey,
      };
    }),
});
