import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import {
  Shield,
  FileText,
  Building2,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Plus,
} from "lucide-react";

// Mock debt data
const mockDebts = [
  {
    id: 1,
    collector: "Midland Credit Management",
    originalCreditor: "Capital One",
    amount: 3288,
    dateReceived: "2024-12-01",
    status: "pending_validation",
    letterSent: null,
  },
  {
    id: 2,
    collector: "Portfolio Recovery Associates",
    originalCreditor: "Discover",
    amount: 5614,
    dateReceived: "2024-11-15",
    status: "validated",
    letterSent: "2024-11-20",
  },
  {
    id: 3,
    collector: "LVNV Funding",
    originalCreditor: "Synchrony Bank",
    amount: 2100,
    dateReceived: "2024-10-28",
    status: "failed_validation",
    letterSent: "2024-11-01",
  },
];

export default function DebtValidation() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDebt, setNewDebt] = useState({
    collector: "",
    originalCreditor: "",
    amount: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLetter = async (debtId: number) => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("Debt validation letter generated!");
    setIsGenerating(false);
  };

  const handleAddDebt = () => {
    if (!newDebt.collector || !newDebt.amount) {
      toast.error("Please fill in required fields");
      return;
    }
    toast.success("Debt added successfully!");
    setShowAddForm(false);
    setNewDebt({ collector: "", originalCreditor: "", amount: "" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_validation":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending Validation</Badge>;
      case "validated":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Validated</Badge>;
      case "failed_validation":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Failed Validation</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const pendingCount = mockDebts.filter((d) => d.status === "pending_validation").length;
  const failedCount = mockDebts.filter((d) => d.status === "failed_validation").length;
  const totalAmount = mockDebts.reduce((sum, d) => sum + d.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-cyan-400" />
              Debt Validation
            </h1>
            <p className="text-slate-400 mt-1">
              Request debt validation under the FDCPA
            </p>
          </div>
          <Button
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Debt
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{mockDebts.length}</p>
                  <p className="text-xs text-slate-400">Total Debts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pendingCount}</p>
                  <p className="text-xs text-slate-400">Pending Validation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{failedCount}</p>
                  <p className="text-xs text-slate-400">Failed Validation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">${totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Total Debt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Debt Form */}
        {showAddForm && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Add New Debt</CardTitle>
              <CardDescription className="text-slate-400">
                Enter details about the debt collector contacting you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Debt Collector Name *</Label>
                  <Input
                    value={newDebt.collector}
                    onChange={(e) => setNewDebt({ ...newDebt, collector: e.target.value })}
                    placeholder="e.g., Midland Credit Management"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Original Creditor</Label>
                  <Input
                    value={newDebt.originalCreditor}
                    onChange={(e) => setNewDebt({ ...newDebt, originalCreditor: e.target.value })}
                    placeholder="e.g., Capital One"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Amount Claimed *</Label>
                  <Input
                    type="number"
                    value={newDebt.amount}
                    onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
                    placeholder="0.00"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  onClick={handleAddDebt}
                >
                  Add Debt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debts List */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Your Debts</CardTitle>
            <CardDescription className="text-slate-400">
              Manage and validate debts from collection agencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockDebts.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No debts added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockDebts.map((debt) => (
                  <div
                    key={debt.id}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-white">{debt.collector}</span>
                          {getStatusBadge(debt.status)}
                        </div>
                        {debt.originalCreditor && (
                          <p className="text-sm text-slate-400 mb-1">
                            Original Creditor: {debt.originalCreditor}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-red-400">
                            <DollarSign className="h-3 w-3" />
                            ${debt.amount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-3 w-3" />
                            Received: {debt.dateReceived}
                          </span>
                          {debt.letterSent && (
                            <span className="flex items-center gap-1 text-cyan-400">
                              <Send className="h-3 w-3" />
                              Letter Sent: {debt.letterSent}
                            </span>
                          )}
                        </div>
                      </div>
                      {debt.status === "pending_validation" && (
                        <Button
                          size="sm"
                          className="bg-cyan-500 hover:bg-cyan-600 text-white"
                          onClick={() => handleGenerateLetter(debt.id)}
                          disabled={isGenerating}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Generate Letter
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              About Debt Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="font-medium text-white mb-2">Your Rights Under FDCPA</h4>
                <p className="text-sm text-slate-400">
                  Under the Fair Debt Collection Practices Act, you have the right to request
                  validation of any debt within 30 days of first contact.
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="font-medium text-white mb-2">What They Must Provide</h4>
                <p className="text-sm text-slate-400">
                  Collectors must provide: the amount owed, original creditor name,
                  proof you owe the debt, and verification the debt is within statute of limitations.
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="font-medium text-white mb-2">If They Can't Validate</h4>
                <p className="text-sm text-slate-400">
                  If the collector cannot validate the debt, they must cease collection
                  and remove the account from your credit reports.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
