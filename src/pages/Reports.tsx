import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserLayout } from "@/components/layout/UserLayout";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from "recharts";
import { useExpenses } from "@/hooks/useExpenses";
import { useDailyBudget } from "@/hooks/useDailyBudget";
import { useBudgets } from "@/hooks/useBudgets";

const chartConfig = {
  spent: { label: "Spent", color: "hsl(var(--destructive))" },
  budget: { label: "Budget", color: "hsl(var(--success))" },
  actual: { label: "Actual", color: "hsl(var(--warning))" },
  income: { label: "Income", color: "hsl(var(--success))" },
  expenses: { label: "Expenses", color: "hsl(var(--destructive))" },
};

const categoryColors: Record<string, string> = {
  Food: "hsl(var(--warning))",
  Transportation: "hsl(var(--info))",
  School: "hsl(142, 76%, 36%)",
  Savings: "hsl(var(--success))",
  Wants: "hsl(var(--destructive))",
  Others: "hsl(var(--muted-foreground))",
};

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("month");
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { dailyBudget, monthlyAllowance, daysInMonth } = useDailyBudget();
  const { allocations, isLoading: budgetsLoading } = useBudgets();

  // Calculate expenses by category from real data
  const expensesByCategory = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthlyExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const categoryTotals: Record<string, number> = {};
    monthlyExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      fill: categoryColors[name] || "hsl(var(--muted-foreground))",
    }));
  }, [expenses]);

  // Calculate weekly trend from real data
  const weeklyTrend = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    return days.map((day, index) => {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - dayOfWeek + index);
      const dateStr = targetDate.toISOString().split("T")[0];
      
      const dayExpenses = expenses.filter(e => e.date === dateStr);
      const spent = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      
      return { day, spent, budget: dailyBudget };
    });
  }, [expenses, dailyBudget]);

  // Calculate budget vs actual
  const budgetVsActual = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthlyExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    // Map categories to budget types
    const needsCategories = ["Food", "Transportation", "School"];
    const wantsCategories = ["Wants", "Others"];
    const savingsCategories = ["Savings"];

    const needsAllocation = allocations.find(a => a.category === "needs")?.amount || 50;
    const wantsAllocation = allocations.find(a => a.category === "wants")?.amount || 30;
    const savingsAllocation = allocations.find(a => a.category === "savings")?.amount || 20;

    const needsBudget = Math.round((monthlyAllowance * needsAllocation) / 100);
    const wantsBudget = Math.round((monthlyAllowance * wantsAllocation) / 100);
    const savingsBudget = Math.round((monthlyAllowance * savingsAllocation) / 100);

    const needsActual = monthlyExpenses.filter(e => needsCategories.includes(e.category)).reduce((sum, e) => sum + Number(e.amount), 0);
    const wantsActual = monthlyExpenses.filter(e => wantsCategories.includes(e.category)).reduce((sum, e) => sum + Number(e.amount), 0);
    const savingsActual = monthlyExpenses.filter(e => savingsCategories.includes(e.category)).reduce((sum, e) => sum + Number(e.amount), 0);

    return [
      { category: "Needs", budget: needsBudget, actual: needsActual },
      { category: "Wants", budget: wantsBudget, actual: wantsActual },
      { category: "Savings", budget: savingsBudget, actual: savingsActual },
    ];
  }, [expenses, allocations, monthlyAllowance]);

  const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + cat.value, 0);
  const avgDaily = expenses.length > 0 ? Math.round(totalExpenses / Math.min(new Date().getDate(), daysInMonth)) : 0;
  const topCategory = expensesByCategory.length > 0 
    ? expensesByCategory.reduce((a, b) => a.value > b.value ? a : b) 
    : { name: "None", value: 0 };

  const isLoading = expensesLoading || budgetsLoading;

  if (isLoading) {
    return (
      <UserLayout title="Reports & Insights" subtitle="Understand your spending behavior">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Reports & Insights" subtitle="Understand your spending behavior">
      <div className="max-w-6xl mx-auto">

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={selectedPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("week")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            This Week
          </Button>
          <Button 
            variant={selectedPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("month")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            This Month
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-foreground">₱{totalExpenses.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-info/10">
                  <BarChart3 className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                  <p className="text-2xl font-bold text-foreground">₱{avgDaily.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-warning/10">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Top Category</p>
                  <p className="text-2xl font-bold text-foreground">{topCategory.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expense Pie Chart */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Expenses by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {expensesByCategory.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.fill }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                    <span className="font-medium">₱{cat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Spending Trend */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Spending Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={weeklyTrend}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="spent" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--destructive))" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="budget" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">Actual Spent</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-0.5 bg-success" style={{ borderStyle: "dashed" }} />
                  <span className="text-muted-foreground">Daily Budget</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget vs Actual */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Budget vs Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={budgetVsActual} layout="vertical">
                  <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} />
                  <YAxis type="category" dataKey="category" tickLine={false} axisLine={false} width={60} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="budget" fill="hsl(var(--success))" radius={4} barSize={20} />
                  <Bar dataKey="actual" fill="hsl(var(--warning))" radius={4} barSize={20} />
                </BarChart>
              </ChartContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded bg-success" />
                  <span className="text-muted-foreground">Budget</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded bg-warning" />
                  <span className="text-muted-foreground">Actual</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Month Summary */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                This Month Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-1">Monthly Allowance</p>
                  <p className="text-3xl font-bold text-foreground">₱{monthlyAllowance.toLocaleString()}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-destructive/10 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                    <p className="text-xl font-bold text-destructive">₱{totalExpenses.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-success/10 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                    <p className="text-xl font-bold text-success">₱{(monthlyAllowance - totalExpenses).toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted text-center">
                  <p className="text-sm text-muted-foreground mb-1">Usage</p>
                  <p className="text-lg font-bold text-foreground">
                    {monthlyAllowance > 0 ? Math.round((totalExpenses / monthlyAllowance) * 100) : 0}% of budget used
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spending Behavior Summary */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Spending Behavior Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Key Insights</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-warning">•</span>
                    <span>You tend to spend more on weekends. Consider setting stricter weekend budgets.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">•</span>
                    <span>Food is your largest expense category at 37% of total spending.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>You've exceeded your "Wants" budget by ₱80 this month.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Recommendations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">💡</span>
                    <span>Try meal prepping to reduce daily food expenses.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">💡</span>
                    <span>Set up a "no-spend" day once a week to boost savings.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">💡</span>
                    <span>Transfer savings immediately when you receive allowance.</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default Reports;
