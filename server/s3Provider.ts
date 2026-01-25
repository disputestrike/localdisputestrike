import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuration relies on environment variables:
// AWS_REGION
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY
// S3_BUCKET_NAME

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "disputestrike-uploads";

// Create S3 client - will use AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from env
const s3Client = new S3Client({ 
  region: REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

class S3ProviderService {
  private bucketName: string;

  constructor() {
    this.bucketName = BUCKET_NAME;
  }

  /**
   * Generates a pre-signed URL for uploading (PUT) a file to S3.
   * Client will use this URL to upload directly to S3.
   * @param key The S3 key (path) for the file.
   * @param contentType The content type of the file.
   * @returns A promise that resolves to the pre-signed PUT URL string.
   */
  async getSignedUploadUrl(key: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    // The URL expires in 15 minutes
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 15 });
    
    // The public URL where the file will be accessible after upload
    const fileUrl = `https://${this.bucketName}.s3.${REGION}.amazonaws.com/${key}`;
    
    return { uploadUrl, fileUrl };
  }

  /**
   * Generates a pre-signed URL for downloading (GET) a file from S3.
   * @param key The S3 key (path) for the file.
   * @returns A promise that resolves to the pre-signed GET URL string.
   */
  async getSignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    // The URL expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 });
    
    return signedUrl;
  }

  /**
   * Get the public URL for a file (assumes bucket has public read access)
   * @param key The S3 key (path) for the file.
   * @returns The public URL string.
   */
  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${REGION}.amazonaws.com/${key}`;
  }

  /**
   * Get bucket name
   */
  getBucketName(): string {
    return this.bucketName;
  }
}

export const s3Provider = new S3ProviderService();
