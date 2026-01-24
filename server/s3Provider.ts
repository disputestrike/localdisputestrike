import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-presigner";

// Configuration relies on environment variables:
// AWS_REGION
// S3_BUCKET_NAME

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "disputestrike-uploads";

const s3Client = new S3Client({ region: REGION });

class S3ProviderService {
  /**
   * Generates a pre-signed URL for uploading a file to S3.
   * @param key The S3 key (path) for the file.
   * @param contentType The content type of the file.
   * @returns A promise that resolves to the pre-signed URL string.
   */
  async getSignedUrl(key: string, contentType: string): Promise<string> {
    const command = {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ACL: "public-read", // Assuming files should be publicly readable for AI analysis
    };

    // The URL expires in 15 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 15 });
    
    return signedUrl;
  }
}

export const s3Provider = new S3ProviderService();
