import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";

/**
 * Router for file upload operations
 */
export const uploadRouter = router({
  /**
   * Upload file to S3
   */
  uploadToS3: protectedProcedure
    .input(z.object({
      fileKey: z.string(),
      fileData: z.array(z.number()), // Uint8Array as number array
      contentType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { fileKey, fileData, contentType } = input;
      
      // Convert number array back to Buffer
      const buffer = Buffer.from(fileData);
      
      // Upload to S3
      const result = await storagePut(fileKey, buffer, contentType);
      
      return {
        url: result.url,
        key: fileKey,
      };
    }),
});
