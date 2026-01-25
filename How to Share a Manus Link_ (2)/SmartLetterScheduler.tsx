import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Zap,
  TrendingUp,
  Timer,
  CalendarDays,
  Send,
  Sparkles
} from "lucide-react";
import { format, addDays, isWeekend, startOfWeek, endOfWeek, isSameDay } from "date-fns";

interface DisputeLetter {
  id: number;
  bureau: string;
  status: string;
  createdAt: string;
  mailedAt?: string;
  responseDeadline?: string;
}

interface SmartLetterSchedulerProps {
  letters: DisputeLetter[];
  onScheduleMail?: (letterId: number, date: Date) => void;
}

interface ScheduleRecommendation {
  date: Date;
  score: number;
  reasons: string[];
  isOptimal: boolean;
}

export function SmartLetterScheduler({ letters, onScheduleMail }: SmartLetterSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedLetterId, setSelectedLetterId] = useState<number | null>(null);

  // Get pending letters (not yet mailed)
  const pendingLetters = useMemo(() => {