import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Zap,
  Scale,
  Calendar,
  DollarSign,
  FileWarning,
  Shield,
  Sparkles
} from "lucide-react";

interface NegativeAccount {
  id: number;
  accountName: string;
  accountNumber?: string;
  accountType?: string;
  balance?: string;
  status?: string;
  dateOpened?: string;
  lastActivity?: string;
  originalCreditor?: string;
  transunionData?: string;
  equifaxData?: string;
  experianData?: string;
  hasConflicts?: boolean;
  conflictDetails?: string;
}

interface DisputeSuccessPredictorProps {
  accounts: NegativeAccount[];
  onSelectAccounts?: (accountIds: number[]) => void;
}

interface PredictionResult {
  accountId: number;
  accountName: string;
  successProbability: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  factors: {
    name: string;