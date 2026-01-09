import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  FolderLock, 
  Upload, 
  FileText, 
  Image, 
  Download, 
  Trash2, 
  Eye,
  Shield,
  Clock,
  Search,
  Filter,
  Plus,
  CreditCard,
  Home,
  FileCheck,
  Mail,
  Receipt,
  File,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Document {
  id: number;
  documentType: string;
  documentName: string;
  description?: string | null;
  fileName: string;
  fileSize?: number | null;
  mimeType?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
}

interface DocumentVaultProps {
  documents?: Document[];
  onUpload?: (file: File, documentType: string, documentName: string) => Promise<void>;
  onDelete?: (documentId: number) => Promise<void>;
  onView?: (documentId: number) => void;
  onDownload?: (documentId: number) => void;
  isLoading?: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'government_id', label: 'Government ID', icon: CreditCard, category: 'Identity' },
  { value: 'drivers_license', label: "Driver's License", icon: CreditCard, category: 'Identity' },
  { value: 'passport', label: 'Passport', icon: CreditCard, category: 'Identity' },
  { value: 'social_security_card', label: 'Social Security Card', icon: Shield, category: 'Identity' },
  { value: 'utility_bill', label: 'Utility Bill', icon: Home, category: 'Address Proof' },
  { value: 'bank_statement', label: 'Bank Statement', icon: FileText, category: 'Address Proof' },
  { value: 'lease_agreement', label: 'Lease Agreement', icon: Home, category: 'Address Proof' },
  { value: 'mortgage_statement', label: 'Mortgage Statement', icon: Home, category: 'Address Proof' },
  { value: 'pay_stub', label: 'Pay Stub', icon: Receipt, category: 'Income' },
  { value: 'tax_return', label: 'Tax Return', icon: FileCheck, category: 'Income' },
  { value: 'proof_of_address', label: 'Other Proof of Address', icon: Home, category: 'Address Proof' },
  { value: 'dispute_letter', label: 'Dispute Letter', icon: Mail, category: 'Dispute Documents' },
  { value: 'bureau_response', label: 'Bureau Response', icon: Mail, category: 'Dispute Documents' },
  { value: 'certified_mail_receipt', label: 'Certified Mail Receipt', icon: Receipt, category: 'Dispute Documents' },
  { value: 'return_receipt', label: 'Return Receipt (Green Card)', icon: Receipt, category: 'Dispute Documents' },
  { value: 'other', label: 'Other Document', icon: File, category: 'Other' },
];

const DOCUMENT_CATEGORIES = ['Identity', 'Address Proof', 'Income', 'Dispute Documents', 'Other'];

export default function DocumentVault({
  documents = [],
  onUpload,
  onDelete,
  onView,
  onDownload,
  isLoading = false,
}: DocumentVaultProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [documentName, setDocumentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [documentName]);

  const handleUpload = async () => {
    if (!selectedFile || !documentType || !documentName || !onUpload) return;
    
    setIsUploading(true);
    try {
      await onUpload(selectedFile, documentType, documentName);
      setIsUploadOpen(false);
      setSelectedFile(null);
      setDocumentType('');
      setDocumentName('');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!onDelete) return;
    try {
      await onDelete(documentId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocumentIcon = (type: string) => {
    const docType = DOCUMENT_TYPES.find(t => t.value === type);
    return docType?.icon || File;
  };

  const getDocumentLabel = (type: string) => {
    const docType = DOCUMENT_TYPES.find(t => t.value === type);
    return docType?.label || type;
  };

  const getDocumentCategory = (type: string) => {
    const docType = DOCUMENT_TYPES.find(t => t.value === type);
    return docType?.category || 'Other';
  };

  const isExpiringSoon = (expiresAt: Date | null | undefined) => {
    if (!expiresAt) return false;
    const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiresAt: Date | null | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || getDocumentCategory(doc.documentType) === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group documents by category
  const groupedDocuments = DOCUMENT_CATEGORIES.reduce((acc, category) => {
    const categoryDocs = filteredDocuments.filter(doc => getDocumentCategory(doc.documentType) === category);
    if (categoryDocs.length > 0) {
      acc[category] = categoryDocs;
    }
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <FolderLock className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Document Vault
                <Shield className="h-4 w-4 text-green-500" />
              </CardTitle>
              <CardDescription>
                Securely store ID, proof of address, and dispute documents
              </CardDescription>
            </div>
          </div>
          
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Add a document to your secure vault
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map(category => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                            {category}
                          </div>
                          {DOCUMENT_TYPES.filter(t => t.category === category).map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="e.g., Driver's License - Front"
                  />
                </div>

                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div className="text-left">
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to select a file</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={!selectedFile || !documentType || !documentName || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {DOCUMENT_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Document Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{documents.length}</div>
            <div className="text-xs text-blue-600">Total Documents</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">
              {documents.filter(d => ['government_id', 'drivers_license', 'passport'].includes(d.documentType)).length}
            </div>
            <div className="text-xs text-green-600">ID Documents</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">
              {documents.filter(d => ['dispute_letter', 'bureau_response', 'certified_mail_receipt'].includes(d.documentType)).length}
            </div>
            <div className="text-xs text-purple-600">Dispute Docs</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-700">
              {documents.filter(d => isExpiringSoon(d.expiresAt)).length}
            </div>
            <div className="text-xs text-yellow-600">Expiring Soon</div>
          </div>
        </div>

        {/* Documents List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FolderLock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
            <p className="text-gray-500 mb-4">
              Upload your ID, proof of address, and dispute documents to keep them secure and organized.
            </p>
            <Button onClick={() => setIsUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedDocuments).map(([category, docs]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-500 mb-3">{category}</h3>
                <div className="space-y-2">
                  {docs.map(doc => {
                    const Icon = getDocumentIcon(doc.documentType);
                    const expired = isExpired(doc.expiresAt);
                    const expiringSoon = isExpiringSoon(doc.expiresAt);
                    
                    return (
                      <div 
                        key={doc.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          expired ? 'border-red-200 bg-red-50' :
                          expiringSoon ? 'border-yellow-200 bg-yellow-50' :
                          'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            expired ? 'bg-red-100' :
                            expiringSoon ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              expired ? 'text-red-600' :
                              expiringSoon ? 'text-yellow-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{doc.documentName}</span>
                              {expired && (
                                <Badge variant="destructive" className="text-xs">Expired</Badge>
                              )}
                              {expiringSoon && !expired && (
                                <Badge className="bg-yellow-100 text-yellow-700 text-xs">Expiring Soon</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{getDocumentLabel(doc.documentType)}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span>•</span>
                              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {onView && (
                            <Button variant="ghost" size="sm" onClick={() => onView(doc.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onDownload && (
                            <Button variant="ghost" size="sm" onClick={() => onDownload(doc.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            deleteConfirm === doc.id ? (
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDelete(doc.id)}
                                >
                                  Confirm
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setDeleteConfirm(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setDeleteConfirm(doc.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Notice */}
        <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3">
          <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-700">
            <strong>Your documents are secure.</strong> All files are encrypted at rest and in transit. 
            Only you can access your document vault.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
