import { useState, useEffect } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Target, Wallet, ShoppingBag, PiggyBank, Edit2, Check, Loader2, CalendarDays, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useBudgets } from "@/hooks/useBudgets";
import { useDailyBudget } from "@/hooks/useDailyBudget";
import { useExpenses } from "@/hooks/useExpenses";

interface BudgetCategory {
  id: string;
  name: string;
  icon: any;
  allocation: number;
  color: string;
  expenseCategories: string[]; // Which expense categories map to this budget category
}

const defaultCategories: BudgetCategory[] = [
  { 
    id: "needs", 
    name: "Needs", 
    icon: Wallet, 
    allocation: 50, 
    color: "bg-blue-500",
    expenseCategories: ["Food", "Transportation", "School"]
  },
  { 
    id: "wants", 
    name: "Wants", 
    icon: ShoppingBag, 
    allocation: 30, 
    color: "bg-pink-500",
    expenseCategories: ["Wants", "Others"]
  },
  { 
    id: "savings", 
    name: "Savings", 
    icon: PiggyBank, 
    allocation: 20, 
    color: "bg-success",
    expenseCategories: ["Savings"]
  },
];

const Budget = () => {
  const { allowance, allocations, isLoading: budgetsLoading, setAllowance, upsertBudget } = useBudgets();
  const { expenses } = useExpenses();
  const { 
    dailyBudget,
    todaysTotalBudget,
    spentToday,
    availableToday,
    rolloverAmount,
    totalSpentThisMonth,
    remainingMonthly,
    currentDay,
    daysInMonth,
    daysRemaining,
    isLoading: dailyLoading 
  } = useDailyBudget();
  
  // Calculate spent per category from actual expenses (this month)
  const getSpentForCategory = (category: BudgetCategory): number => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return category.expenseCategories.includes(e.category) &&
               expenseDate.getMonth() === currentMonth &&
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);
  };
  
  const [isEditingAllowance, setIsEditingAllowance] = useState(false);
  const [tempAllowance, setTempAllowance] = useState("");
  
  const [categories, setCategories] = useState<BudgetCategory[]>(defaultCategories);

  // Initialize categories from database allocations
  useEffect(() => {
    if (allocations.length > 0) {
      setCategories(prev => prev.map(cat => {
        const dbAllocation = allocations.find(a => a.category === cat.id);
        return dbAllocation ? { ...cat, allocation: dbAllocation.amount } : cat;
      }));
    }
  }, [allocations]);

  // Set tempAllowance when allowance loads
  useEffect(() => {
    if (allowance > 0) {
      setTempAllowance(allowance.toString());
    }
  }, [allowance]);

  const handleSaveAllowance = () => {
    const value = parseFloat(tempAllowance);
    if (value > 0) {
      setAllowance.mutate(value);
      setIsEditingAllowance(false);
    } else {
      toast.error("Please enter a valid amount");
    }
  };

  const handleAllocationChange = (id: string, value: number) => {
    const updated = categories.map((cat) =>
      cat.id === id ? { ...cat, allocation: value } : cat
    );
    
    const total = updated.reduce((sum, c) => sum + c.allocation, 0);
    if (total <= 100) {
      setCategories(updated);
      // Save to database
      upsertBudget.mutate({ category: id, amount: value });
    } else {
      toast.error("Total allocation cannot exceed 100%");
    }
  };

  const totalAllocated = categories.reduce((sum, c) => sum + c.allocation, 0);

  const isLoading = budgetsLoading || dailyLoading;

  if (isLoading) {
    return (
      <UserLayout title="Budget Planning" subtitle="Allocate your money wisely">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Budget Planning" subtitle="Allocate your money wisely">
      <div className="max-w-4xl mx-auto">

        {/* Today's Budget Card - Daily with Rollover */}
        <div className="rounded-2xl bg-gradient-primary p-6 text-primary-foreground mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary-foreground/80" />
              <p className="text-primary-foreground/80 text-sm">Today's Budget (Day {currentDay}/{daysInMonth})</p>
            </div>
          </div>
          
          <p className="text-4xl font-bold mb-1">
            {allowance > 0 ? `₱${availableToday.toLocaleString()}` : "₱0"}
          </p>
          <p className="text-primary-foreground/70 text-sm">
            {availableToday < 0 ? "Over budget!" : "available today"}
          </p>

          {/* Rollover explanation */}
          {rolloverAmount > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-white/10 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-300" />
              <p className="text-sm">
                +₱{rolloverAmount.toLocaleString()} carried over from previous days!
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-primary-foreground/70 text-xs">Daily Base</p>
              <p className="font-semibold">₱{dailyBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-primary-foreground/70 text-xs">Spent Today</p>
              <p className="font-semibold">₱{spentToday.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-primary-foreground/70 text-xs">Today's Total</p>
              <p className="font-semibold">₱{todaysTotalBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Monthly Allowance Card */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Monthly Allowance</h3>
            {!isEditingAllowance ? (
              <button
                onClick={() => {
                  setTempAllowance(allowance.toString() || "");
                  setIsEditingAllowance(true);
                }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </button>
            ) : (
              <button
                onClick={handleSaveAllowance}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                disabled={setAllowance.isPending}
              >
                {setAllowance.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          
          {isEditingAllowance ? (
            <Input
              type="number"
              value={tempAllowance}
              onChange={(e) => setTempAllowance(e.target.value)}
              className="text-2xl font-bold"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveAllowance()}
            />
          ) : (
            <p className="text-2xl font-bold text-foreground">
              {allowance > 0 ? `₱${allowance.toLocaleString()}` : "Set your allowance →"}
            </p>
          )}
          
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-muted-foreground text-xs">Total Spent</p>
              <p className="font-semibold text-foreground">₱{totalSpentThisMonth.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Remaining</p>
              <p className={`font-semibold ${remainingMonthly < 0 ? "text-destructive" : "text-foreground"}`}>
                ₱{remainingMonthly.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs">Days Left</p>
              <p className="font-semibold text-foreground">{daysRemaining}</p>
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
              const budgetAmount = allowance > 0 ? (allowance * cat.allocation) / 100 : 0;
              const spent = getSpentForCategory(cat);
              const spentPercent = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;
              const isOverBudget = spent > budgetAmount && budgetAmount > 0;

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
                          ₱{spent.toLocaleString()} of ₱{budgetAmount.toLocaleString()}
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
                      Over budget by ₱{(spent - budgetAmount).toLocaleString()}!
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
