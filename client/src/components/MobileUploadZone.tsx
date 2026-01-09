import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Upload, 
  Camera, 
  FileText, 
  CheckCircle2, 
  X,
  Smartphone,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";

interface MobileUploadZoneProps {
  bureau: "transunion" | "equifax" | "experian";
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  hasExistingReport: boolean;
  standalone?: boolean; // If true, renders with Card wrapper
}

export function MobileUploadZone({ 
  bureau, 
  onFileSelect, 
  isUploading, 
  hasExistingReport,
  standalone = false
}: MobileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = useCallback((file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be less than 20MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  // Handle drag events with touch support
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  }, [handleFileChange]);

  // Handle touch events for mobile drag-drop simulation
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const currentY = e.touches[0].clientY;
      const diff = touchStartY - currentY;
      if (diff > 50) {
        setIsDragging(true);
      }
    }
  }, [touchStartY]);

  const handleTouchEnd = useCallback(() => {
    setTouchStartY(null);
    setIsDragging(false);
  }, []);

  // Confirm and upload
  const handleConfirmUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  // Cancel selection
  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Bureau colors
  const bureauColors = {
    transunion: 'from-blue-500 to-blue-600',
    equifax: 'from-red-500 to-red-600',
    experian: 'from-purple-500 to-purple-600',
  };

  const bureauBgColors = {
    transunion: 'bg-blue-50 border-blue-200',
    equifax: 'bg-red-50 border-red-200',
    experian: 'bg-purple-50 border-purple-200',
  };

  if (hasExistingReport) {
    return null;
  }

  // Content to render (shared between standalone and embedded modes)
  const uploadContent = (
    <>
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
        />

        {/* Preview state */}
        {selectedFile && !isUploading ? (
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative rounded-lg overflow-hidden border">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={handleCancel}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <FileText className="h-10 w-10 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-1 hover:bg-muted-foreground/10 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            
            <Button 
              onClick={handleConfirmUpload} 
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Upload {bureau.charAt(0).toUpperCase() + bureau.slice(1)} Report
            </Button>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="mt-4 font-medium">Uploading...</p>
            <p className="text-sm text-muted-foreground">AI will analyze your report</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Drag & Drop Zone - Touch optimized */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-6 cursor-pointer
                transition-all duration-200 ease-in-out
                touch-manipulation select-none
                ${isDragging 
                  ? 'border-primary bg-primary/10 scale-[1.02]' 
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 active:bg-muted'
                }
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`
                  h-14 w-14 rounded-full flex items-center justify-center
                  transition-colors duration-200
                  ${isDragging ? 'bg-primary/20' : 'bg-muted'}
                `}>
                  <Upload className={`h-7 w-7 ${isDragging ? 'text-primary animate-bounce' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-center">
                  <p className="font-medium">
                    {isDragging ? 'Drop file here!' : 'Tap to upload'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF or image files
                  </p>
                </div>
              </div>
            </div>

            {/* Quick action buttons - Mobile optimized */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                className="h-auto py-3 flex-col gap-1.5"
              >
                <Camera className="h-5 w-5" />
                <span className="text-xs">Take Photo</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-auto py-3 flex-col gap-1.5"
              >
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs">From Gallery</span>
              </Button>
            </div>

            {/* Mobile tip */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
              <Smartphone className="h-4 w-4 flex-shrink-0" />
              <span>Tip: Use your phone camera for best results with paper reports</span>
            </div>
          </div>
        )}
    </>
  );

  // Standalone mode with Card wrapper
  if (standalone) {
    return (
      <Card className={`overflow-hidden ${selectedFile ? bureauBgColors[bureau] : ''}`}>
        <CardHeader className={`bg-gradient-to-r ${bureauColors[bureau]} text-white py-3`}>
          <CardTitle className="capitalize text-lg">{bureau}</CardTitle>
          <CardDescription className="text-white/80 text-sm">
            Upload your credit report
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {uploadContent}
        </CardContent>
      </Card>
    );
  }

  // Embedded mode without Card wrapper
  return <div className="space-y-2">{uploadContent}</div>;
}

/**
 * Mobile-optimized upload grid for all 3 bureaus
 */
interface MobileUploadGridProps {
  onFileUpload: (bureau: "transunion" | "equifax" | "experian", file: File) => void;
  uploadingBureau: string | null;
  existingReports: { bureau: string }[];
}

export function MobileUploadGrid({ 
  onFileUpload, 
  uploadingBureau, 
  existingReports 
}: MobileUploadGridProps) {
  const bureaus = ["transunion", "equifax", "experian"] as const;
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {bureaus.map((bureau) => {
        const hasReport = existingReports.some(r => r.bureau === bureau);
        return (
          <MobileUploadZone
            key={bureau}
            bureau={bureau}
            onFileSelect={(file) => onFileUpload(bureau, file)}
            isUploading={uploadingBureau === bureau}
            hasExistingReport={hasReport}
          />
        );
      })}
    </div>
  );
}
