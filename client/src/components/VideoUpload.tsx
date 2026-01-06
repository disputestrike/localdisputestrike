import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Video, X, CheckCircle2, AlertCircle } from "lucide-react";
import { storagePut } from "../../../server/storage";

interface VideoUploadProps {
  onUploadComplete: (videoUrl: string, thumbnailUrl: string, duration: number) => void;
  maxSizeMB?: number;
}

export function VideoUpload({ onUploadComplete, maxSizeMB = 100 }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid video file (MP4, MOV, or WebM)');
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleVideoMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(Math.floor(videoRef.current.duration));
    }
  };

  const generateThumbnail = async (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 2; // Capture frame at 2 seconds
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailUrl = URL.createObjectURL(blob);
              resolve(thumbnailUrl);
            }
          }, 'image/jpeg', 0.8);
        }
      };

      video.src = URL.createObjectURL(videoFile);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Read file as buffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Generate unique file key
      const timestamp = Date.now();
      const fileExtension = selectedFile.name.split('.').pop();
      const fileKey = `video-testimonials/${timestamp}.${fileExtension}`;

      // Simulate upload progress (S3 upload doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload video to S3
      const videoUrl = await fetch('/api/trpc/upload.video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey,
          fileData: Array.from(buffer),
          mimeType: selectedFile.type,
        }),
      }).then(res => res.json()).then(data => data.result.data.url);

      clearInterval(progressInterval);
      setUploadProgress(95);

      // Generate and upload thumbnail
      const thumbnailBlob = await generateThumbnail(selectedFile);
      const thumbnailKey = `video-testimonials/thumbnails/${timestamp}.jpg`;
      
      const thumbnailUrl = await fetch('/api/trpc/upload.thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey: thumbnailKey,
          thumbnailData: thumbnailBlob,
        }),
      }).then(res => res.json()).then(data => data.result.data.url);

      setUploadProgress(100);

      // Call completion callback
      onUploadComplete(videoUrl, thumbnailUrl, videoDuration);

      // Reset state
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload video. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {!selectedFile ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Upload Video Testimonial</p>
            <p className="text-sm text-gray-500 mb-4">
              Click to browse or drag and drop
            </p>
            <p className="text-xs text-gray-400">
              MP4, MOV, or WebM (max {maxSizeMB}MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video Preview */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={previewUrl || ''}
                controls
                onLoadedMetadata={handleVideoMetadata}
                className="w-full max-h-96"
              />
            </div>

            {/* File Info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    {videoDuration > 0 && ` • ${Math.floor(videoDuration / 60)}:${(videoDuration % 60).toString().padStart(2, '0')}`}
                  </p>
                </div>
              </div>
              {!uploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {uploadProgress === 100 && !error && (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm">Video uploaded successfully!</p>
              </div>
            )}

            {/* Action Buttons */}
            {!uploading && uploadProgress !== 100 && (
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  className="flex-1"
                  disabled={videoDuration === 0}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
