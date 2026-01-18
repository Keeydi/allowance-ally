import { useState, useEffect } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Wallet, ShoppingBag, PiggyBank, Edit2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getBudget, updateBudget, Budget } from "@/lib/api/budget";
import { useToast } from "@/hooks/use-toast";

interface BudgetCategory {
  id: string;
  name: string;
  icon: any;
  allocation: number;
  spent: number;
  color: string;
}

const Budget = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingAllowance, setIsEditingAllowance] = useState(false);
  const [tempAllowance, setTempAllowance] = useState("");
  const { toast: toastHook } = useToast();

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    setLoading(true);
    const response = await getBudget();
    if (response.success && response.budget) {
      setBudget(response.budget);
      setTempAllowance(response.budget.totalAllowance.toString());
    } else {
      toastHook({
        title: "Error",
        description: response.message || "Failed to load budget",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSaveAllowance = async () => {
    const value = parseFloat(tempAllowance);
    if (value > 0 && budget) {
      const response = await updateBudget({
        totalAllowance: value,
        periodType: budget.periodType || 'monthly',
        needsAllocation: budget.needsAllocation,
        wantsAllocation: budget.wantsAllocation,
        savingsAllocation: budget.savingsAllocation,
      });
      
      if (response.success && response.budget) {
        setBudget(response.budget);
        setIsEditingAllowance(false);
        toast.success("Allowance updated!");
      } else {
        toast.error(response.message || "Failed to update allowance");
      }
    }
  };

  const handlePeriodTypeChange = async (newPeriodType: 'daily' | 'weekly' | 'monthly') => {
    if (!budget) return;

    const response = await updateBudget({
      totalAllowance: budget.totalAllowance,
      periodType: newPeriodType,
      needsAllocation: budget.needsAllocation,
      wantsAllocation: budget.wantsAllocation,
      savingsAllocation: budget.savingsAllocation,
    });
    
    if (response.success && response.budget) {
      setBudget(response.budget);
      toast.success("Budget period updated!");
    } else {
      toast.error(response.message || "Failed to update budget period");
    }
  };

  const handleAllocationChange = async (id: string, value: number) => {
    if (!budget) return;

    const updated = {
      needsAllocation: id === "needs" ? value : budget.needsAllocation,
      wantsAllocation: id === "wants" ? value : budget.wantsAllocation,
      savingsAllocation: id === "savings" ? value : budget.savingsAllocation,
    };
    
    const total = updated.needsAllocation + updated.wantsAllocation + updated.savingsAllocation;
    if (total <= 100) {
      const response = await updateBudget({
        totalAllowance: budget.totalAllowance,
        periodType: budget.periodType || 'monthly',
        ...updated,
      });
      
      if (response.success && response.budget) {
        setBudget(response.budget);
      } else {
        toast.error(response.message || "Failed to update allocation");
      }
    } else {
      toast.error("Total allocation cannot exceed 100%");
    }
  };

  if (loading) {
    return (
      <UserLayout title="Budget Planning" subtitle="Allocate your money wisely">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading budget...</span>
        </div>
      </UserLayout>
    );
  }

  if (!budget) {
    return (
      <UserLayout title="Budget Planning" subtitle="Allocate your money wisely">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load budget data</p>
        </div>
      </UserLayout>
    );
  }

  const categories: BudgetCategory[] = [
    { id: "needs", name: "Needs", icon: Wallet, allocation: budget.needsAllocation, spent: budget.needsSpent, color: "bg-blue-500" },
    { id: "wants", name: "Wants", icon: ShoppingBag, allocation: budget.wantsAllocation, spent: budget.wantsSpent, color: "bg-pink-500" },
    { id: "savings", name: "Savings", icon: PiggyBank, allocation: budget.savingsAllocation, spent: budget.savingsSpent, color: "bg-success" },
  ];

  const totalAllocated = categories.reduce((sum, c) => sum + c.allocation, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const remaining = budget.totalAllowance - totalSpent;

  return (
    <UserLayout title="Budget Planning" subtitle="Allocate your money wisely">
      <div className="max-w-4xl mx-auto">

        {/* Allowance Card */}
        <div className="rounded-2xl bg-gradient-primary p-6 text-primary-foreground mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <p className="text-primary-foreground/80 text-sm">
                {budget.periodType === 'daily' ? 'Daily' : budget.periodType === 'weekly' ? 'Weekly' : 'Monthly'} Allowance
              </p>
              <Select
                value={budget.periodType || 'monthly'}
                onValueChange={(value) => handlePeriodTypeChange(value as 'daily' | 'weekly' | 'monthly')}
              >
                <SelectTrigger className="w-28 h-7 bg-white/10 border-white/20 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isEditingAllowance ? (
              <button
                onClick={() => setIsEditingAllowance(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSaveAllowance}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {isEditingAllowance ? (
            <Input
              type="number"
              value={tempAllowance}
              onChange={(e) => setTempAllowance(e.target.value)}
              className="text-3xl font-bold bg-white/10 border-white/20 text-white placeholder:text-white/50"
              autoFocus
            />
          ) : (
            <p className="text-3xl font-bold">₱{budget.totalAllowance.toLocaleString()}</p>
          )}
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-primary-foreground/70 text-xs">Spent</p>
              <p className="font-semibold">₱{totalSpent.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-primary-foreground/70 text-xs">Remaining</p>
              <p className="font-semibold">₱{remaining.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Allocation Overview */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Budget Allocation</h3>
            <span className={`text-sm font-medium ${totalAllocated === 100 ? "text-success" : "text-warning"}`}>
              {totalAllocated}% allocated
            </span>
          </div>

          {/* Visual Bar */}
          <div className="h-4 rounded-full bg-muted flex overflow-hidden mb-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`${cat.color} transition-all`}
                style={{ width: `${cat.allocation}%` }}
              />
            ))}
          </div>

          {/* Category Cards */}
          <div className="space-y-4">
            {categories.map((cat) => {
              const budgetAmount = (budget.totalAllowance * cat.allocation) / 100;
              const spentPercent = Math.min((cat.spent / budgetAmount) * 100, 100);
              const isOverBudget = cat.spent > budgetAmount;

              return (
                <div key={cat.id} className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cat.color} text-white`}>
                        <cat.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₱{cat.spent.toLocaleString()} of ₱{budgetAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={cat.allocation}
                        onChange={(e) => handleAllocationChange(cat.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        min={0}
                        max={100}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  
                  <Progress 
                    value={spentPercent} 
                    className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
                  />
                  
                  {isOverBudget && (
                    <p className="text-xs text-destructive mt-2">
                      Over budget by ₱{(cat.spent - budgetAmount).toLocaleString()}!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-2xl border border-primary/20 bg-secondary p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">50/30/20 Rule</h4>
              <p className="text-sm text-muted-foreground">
                A popular budgeting method: 50% for needs (food, transport), 30% for wants (entertainment), 
                and 20% for savings. Adjust based on your priorities!
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Budget;