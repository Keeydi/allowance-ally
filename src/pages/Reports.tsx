import { useState, useEffect } from "react";
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
import { getReports, ReportsData } from "@/lib/api/reports";
import { useToast } from "@/hooks/use-toast";

const chartConfig = {
  spent: { label: "Spent", color: "hsl(var(--destructive))" },
  budget: { label: "Budget", color: "hsl(var(--success))" },
  actual: { label: "Actual", color: "hsl(var(--warning))" },
  income: { label: "Income", color: "hsl(var(--success))" },
  expenses: { label: "Expenses", color: "hsl(var(--destructive))" },
};

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week");
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod]);

  const fetchReports = async () => {
    setLoading(true);
    const response = await getReports(selectedPeriod);
    if (response.success && response.data) {
      setReportsData(response.data);
    } else {
      toast({
        title: "Error",
        description: response.message || "Failed to load reports",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (loading || !reportsData) {
    return (
      <UserLayout title="Reports & Insights" subtitle="Understand your spending behavior">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading reports...</span>
        </div>
      </UserLayout>
    );
  }

  const { expensesByCategory, weeklyTrend, budgetVsActual, monthlyOverview, summary, insights, recommendations } = reportsData;
  const { totalExpenses, avgDaily, topCategory } = summary;

  return (
    <UserLayout title="Reports & Insights" subtitle="Understand your spending behavior">
      <div className="max-w-6xl mx-auto">

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={selectedPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("week")}
            disabled={loading}
          >
            <Calendar className="h-4 w-4 mr-2" />
            This Week
          </Button>
          <Button 
            variant={selectedPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("month")}
            disabled={loading}
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
                  <p className="text-2xl font-bold text-foreground">{topCategory}</p>
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
                  {insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-warning">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                  {insights.length === 0 && (
                    <li className="text-muted-foreground">No insights available yet. Start tracking expenses to see insights!</li>
                  )}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Recommendations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">💡</span>
                      <span>{rec}</span>
                    </li>
                  ))}
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
