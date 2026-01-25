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
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be less than 20MB');
      return;
    }
