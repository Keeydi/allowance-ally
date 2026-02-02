import { Link } from "react-router-dom";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  Plus, 
  Minus, 
  Target, 
  PiggyBank,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useBudgets } from "@/hooks/useBudgets";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";

const Dashboard = () => {
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { allowance, isLoading: budgetsLoading } = useBudgets();
  const { goals, isLoading: savingsLoading } = useSavingsGoals();

  const isLoading = expensesLoading || budgetsLoading || savingsLoading;

  // Calculate real data
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remaining = allowance - totalSpent;
  const budgetUsed = allowance > 0 ? Math.min(Math.round((totalSpent / allowance) * 100), 100) : 0;

  // Get the first savings goal for display
  const primaryGoal = goals.length > 0 ? goals[0] : null;
  const savingsProgress = primaryGoal 
    ? (Number(primaryGoal.current_amount) / Number(primaryGoal.target_amount)) * 100 
    : 0;

  // Get recent expenses (last 3)
  const recentExpenses = expenses.slice(0, 3);

  if (isLoading) {
    return (
      <UserLayout title="Dashboard" subtitle="Your financial overview">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Dashboard" subtitle="Your financial overview">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Good morning! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your financial overview for this month.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Plus, label: "Add Allowance", color: "bg-success-light text-success", link: "/budget" },
            { icon: Minus, label: "Add Expense", color: "bg-warning-light text-warning", link: "/expenses" },
            { icon: Target, label: "Set Budget", color: "bg-info-light text-info", link: "/budget" },
            { icon: PiggyBank, label: "Add Savings", color: "bg-secondary text-secondary-foreground", link: "/savings" },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.link}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:shadow-card transition-all group"
            >
              <div className={`p-3 rounded-lg ${action.color} transition-transform group-hover:scale-110`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Main Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Balance Card */}
          <div className="md:col-span-2 lg:col-span-1 rounded-2xl bg-gradient-primary p-6 text-primary-foreground shadow-glow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-primary-foreground/80 text-sm font-medium">
                Remaining Balance
              </span>
              <Wallet className="h-5 w-5 text-primary-foreground/80" />
            </div>
            <p className="text-4xl font-bold mb-1">
              {allowance > 0 ? `₱${remaining.toLocaleString()}` : "₱0"}
            </p>
            <p className="text-primary-foreground/70 text-sm">
              {allowance > 0 
                ? `of ₱${allowance.toLocaleString()} monthly allowance`
                : "Set your allowance in Budget"}
            </p>
          </div>

          {/* Budget Overview Card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Budget Status</h3>
              <span className="text-sm font-medium text-muted-foreground">
                {budgetUsed}% used
              </span>
            </div>
            
            <Progress value={budgetUsed} className="h-3 mb-4" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success-light">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Income</p>
                  <p className="font-semibold text-foreground">₱{allowance.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning-light">
                  <TrendingDown className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="font-semibold text-foreground">₱{totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Goal Card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Savings Goal</h3>
              <PiggyBank className="h-5 w-5 text-primary" />
            </div>
            
            {primaryGoal ? (
              <>
                <p className="text-sm text-muted-foreground mb-2">{primaryGoal.name}</p>
                
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${savingsProgress * 2.51} 251`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">
                      {Math.round(savingsProgress)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    ₱{Number(primaryGoal.current_amount).toLocaleString()} of ₱{Number(primaryGoal.target_amount).toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm mb-2">No savings goals yet</p>
                <Link to="/savings">
                  <Button variant="outline" size="sm">
                    Create Goal
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Recent Expenses */}
          <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Recent Expenses</h3>
              <Link to="/expenses">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            {recentExpenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No expenses yet. Start tracking!</p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background">
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{expense.category}</p>
                        <p className="text-xs text-muted-foreground">{expense.date}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-foreground">
                      -₱{Number(expense.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 rounded-2xl border border-primary/20 bg-secondary p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Money Tip of the Day</h4>
              <p className="text-sm text-muted-foreground">
                Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. 
                This simple split helps you balance enjoyment with responsibility!
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Dashboard;
