import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  Award,
  ChevronUp,
  ChevronDown,
  Minus,
  Download,
  Plus,
  FileText
} from "lucide-react";

interface ScoreDataPoint {
  date: string;
  score: number;
  bureau?: string;
  event?: string;
}

interface CreditScoreChartProps {
  scoreHistory?: ScoreDataPoint[];
  currentScore?: number;
  targetScore?: number;
}

export function CreditScoreChart({ 
  scoreHistory: propScoreHistory = [], 
  currentScore: propCurrentScore = 0,
  targetScore = 750 
}: CreditScoreChartProps) {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  const [showAddScoreModal, setShowAddScoreModal] = useState(false);
  const [newScoreBureau, setNewScoreBureau] = useState<'transunion' | 'equifax' | 'experian'>('transunion');
  const [newScoreValue, setNewScoreValue] = useState('');
  const [newScoreModel, setNewScoreModel] = useState('');
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch real score history from database