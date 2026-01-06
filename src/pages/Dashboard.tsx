import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
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
  ArrowRight
} from "lucide-react";

// Mock data for demo
const mockData = {
  balance: 650,
  allowance: 2500,
  spent: 1850,
  budgetUsed: 74,
  recentExpenses: [
    { id: 1, category: "Food", amount: 150, date: "Today" },
    { id: 2, category: "Transportation", amount: 80, date: "Yesterday" },
    { id: 3, category: "School", amount: 250, date: "Jan 4" },
  ],
  savingsGoal: {
    name: "New Backpack",
    target: 1500,
    current: 850,
  },
};

const Dashboard = () => {
  const savingsProgress = (mockData.savingsGoal.current / mockData.savingsGoal.target) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
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
            { icon: Plus, label: "Add Allowance", color: "bg-success-light text-success" },
            { icon: Minus, label: "Add Expense", color: "bg-warning-light text-warning" },
            { icon: Target, label: "Set Budget", color: "bg-info-light text-info" },
            { icon: PiggyBank, label: "Add Savings", color: "bg-secondary text-secondary-foreground" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:shadow-card transition-all group"
            >
              <div className={`p-3 rounded-lg ${action.color} transition-transform group-hover:scale-110`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </button>
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
            <p className="text-4xl font-bold mb-1">₱{mockData.balance.toLocaleString()}</p>
            <p className="text-primary-foreground/70 text-sm">
              of ₱{mockData.allowance.toLocaleString()} monthly allowance
            </p>
          </div>

          {/* Budget Overview Card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Budget Status</h3>
              <span className="text-sm font-medium text-muted-foreground">
                {mockData.budgetUsed}% used
              </span>
            </div>
            
            <Progress value={mockData.budgetUsed} className="h-3 mb-4" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success-light">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Income</p>
                  <p className="font-semibold text-foreground">₱{mockData.allowance.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning-light">
                  <TrendingDown className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="font-semibold text-foreground">₱{mockData.spent.toLocaleString()}</p>
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
            
            <p className="text-sm text-muted-foreground mb-2">{mockData.savingsGoal.name}</p>
            
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
                ₱{mockData.savingsGoal.current.toLocaleString()} of ₱{mockData.savingsGoal.target.toLocaleString()}
              </p>
            </div>
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
            
            <div className="space-y-3">
              {mockData.recentExpenses.map((expense) => (
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
                    -₱{expense.amount}
                  </span>
                </div>
              ))}
            </div>
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
      </main>
    </div>
  );
};

export default Dashboard;
