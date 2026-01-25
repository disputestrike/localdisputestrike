# Upload Flow Analysis - CRITICAL ISSUES

## Current Flow (BROKEN)

### Step 1: Client calls uploadToS3 mutation
```typescript
const uploadResult = await uploadToS3.mutateAsync({
  fileKey: `credit-reports/${bureau}/${Date.now()}_${file.name}`,
  contentType: file.type,
});
```

### Step 2: Server uploadToS3 mutation (PROBLEM HERE)
```typescript
uploadToS3: protectedProcedure
  .input(z.object({
    fileKey: z.string(),
    contentType: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const timestamp = Date.now();
    const secureFileKey = `uploads/${userId}/${timestamp}_${input.fileKey.split('/').pop()}`;
    
    // PROBLEM: This does NOT actually upload to S3!
    // It just generates a URL and returns it
    return { 
      url: `https://disputestrike-uploads.s3.amazonaws.com/${secureFileKey}`, 
      key: secureFileKey 
    };
  }),
```

### Step 3: Client calls creditReports.upload mutation
```typescript
await uploadReport.mutateAsync({
  bureau: bureau,
  fileName: file.name,
  fileUrl: uploadResult.url,  // This URL points to nothing!
  fileKey: uploadResult.key,
});
```

### Step 4: Server creditReports.upload mutation
```typescript
upload: protectedProcedure
  .mutation(async ({ ctx, input }) => {
    const report = await db.createCreditReport({
      userId,
      bureau: input.bureau,
      fileUrl: input.fileUrl,  // URL to non-existent file
      fileKey: input.fileKey,
      fileName: input.fileName,
      isParsed: false,
    });
    // Tries to parse a file that doesn't exist
    parseAndSaveReport(report.id, input.fileUrl, input.bureau, userId);
  }),
```

## ROOT CAUSE

**The file is NEVER actually uploaded to S3!**

The `uploadToS3` mutation only generates a URL but doesn't:
1. Receive the actual file data from the client
2. Upload anything to S3

## SOLUTION REQUIRED

### Option A: Use Pre-signed URLs (Recommended for large files)
1. Server generates a pre-signed PUT URL using AWS SDK
2. Client uploads directly to S3 using that URL
3. Client then notifies server of successful upload

### Option B: Server-side upload via base64 (Simpler but limited)
1. Client sends file as base64 in the mutation
2. Server decodes and uploads to S3
3. Server returns the final URL

### Option C: Use a file upload middleware (multer, formidable)
1. Client sends file via multipart form data
2. Server receives file and uploads to S3
3. Server returns the final URL

## IMPLEMENTATION FIX

I will implement Option A (Pre-signed URLs) as it's the most scalable:

1. Add AWS SDK to server
2. Create a real `getSignedUrl` that returns a PUT pre-signed URL
3. Client uploads file directly to S3
4. Client calls `creditReports.upload` with the confirmed URL

## ADDITIONAL ISSUES

### Database Insert Error
The Railway logs show:
```
Failed query: insert into `credit_reports` (`id`, `userId`, `bureau`, `fileUrl`, 
`fileKey`, `fileName`, `uploadedAt`, `parsedData`, `isParsed`, ...)
values (default, ?, ?, ?, ?, ?, default, default, ?, ...)
```

This suggests the insert IS working, but the file at the URL doesn't exist for parsing.

### Missing Tables
- `subscriptions_v2` - needs migration
- `dispute_rounds` - needs migration
