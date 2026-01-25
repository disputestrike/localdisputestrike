import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  FileText,
  Scale,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Mail,
  FileWarning,
  Gavel,
  Building2,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface DisputeOutcome {
  id: number;
  accountName: string;
  bureau: string;
  outcome: 'deleted' | 'verified' | 'updated' | 'no_response' | 'pending';
  responseReceivedAt?: string;
  letterMailedAt?: string;
  deadlineDate?: string;
  responseNotes?: string;
  updatedFields?: string;
}

interface BureauResponseAnalyzerProps {
  outcomes: DisputeOutcome[];
  onGenerateFollowUp?: (outcomeId: number, strategy: string) => void;
  onFileCFPB?: (bureau: string) => void;
}

interface NextStep {
  id: string;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';