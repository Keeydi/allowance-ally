import { useState } from "react";
import { TrendingUp, TrendingDown, PieChart, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserLayout } from "@/components/layout/UserLayout";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from "recharts";

// Mock data for charts
const expensesByCategory = [
  { name: "Food", value: 450, fill: "hsl(var(--success))" },
  { name: "Transportation", value: 200, fill: "hsl(var(--warning))" },
  { name: "School", value: 300, fill: "hsl(var(--info))" },
  { name: "Wants", value: 150, fill: "hsl(var(--destructive))" },
  { name: "Others", value: 100, fill: "hsl(var(--muted-foreground))" },
];

const weeklyTrend = [
  { day: "Mon", spent: 120, budget: 150 },
  { day: "Tue", spent: 80, budget: 150 },
  { day: "Wed", spent: 200, budget: 150 },
  { day: "Thu", spent: 90, budget: 150 },
  { day: "Fri", spent: 180, budget: 150 },
  { day: "Sat", spent: 250, budget: 150 },
  { day: "Sun", spent: 100, budget: 150 },
];

const budgetVsActual = [
  { category: "Needs", budget: 600, actual: 550 },
  { category: "Wants", budget: 300, actual: 380 },
  { category: "Savings", budget: 300, actual: 200 },
];

const monthlyOverview = [
  { month: "Jan", income: 3000, expenses: 2400 },
  { month: "Feb", income: 3000, expenses: 2100 },
  { month: "Mar", income: 3200, expenses: 2800 },
  { month: "Apr", income: 3000, expenses: 2200 },
];

const chartConfig = {
  spent: { label: "Spent", color: "hsl(var(--destructive))" },
  budget: { label: "Budget", color: "hsl(var(--success))" },
  actual: { label: "Actual", color: "hsl(var(--warning))" },
  income: { label: "Income", color: "hsl(var(--success))" },
  expenses: { label: "Expenses", color: "hsl(var(--destructive))" },
};

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week");
  
  const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + cat.value, 0);
  const avgDaily = Math.round(totalExpenses / 7);
  const topCategory = expensesByCategory.reduce((a, b) => a.value > b.value ? a : b);

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

          {/* Monthly Income vs Expenses */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={monthlyOverview}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `₱${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded bg-success" />
                  <span className="text-muted-foreground">Income</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded bg-destructive" />
                  <span className="text-muted-foreground">Expenses</span>
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
