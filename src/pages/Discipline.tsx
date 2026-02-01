import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Lightbulb, ShieldCheck, TrendingDown, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserLayout } from "@/components/layout/UserLayout";

interface Alert {
  id: string;
  type: "warning" | "danger" | "success";
  title: string;
  message: string;
  category?: string;
  percentage?: number;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "danger",
    title: "Budget Limit Reached!",
    message: "You've spent 100% of your 'Wants' budget for this week.",
    category: "Wants",
    percentage: 100,
  },
  {
    id: "2",
    type: "warning",
    title: "Approaching Limit",
    message: "You've used 85% of your 'Food' budget. ₱75 remaining.",
    category: "Food",
    percentage: 85,
  },
  {
    id: "3",
    type: "success",
    title: "Great Savings!",
    message: "You've saved ₱200 this week. Keep it up!",
  },
];

const dailyTips = [
  {
    icon: "🎯",
    title: "Avoid impulse buying",
    description: "Wait 24 hours before making any non-essential purchase. If you still want it tomorrow, consider it then.",
  },
  {
    icon: "💰",
    title: "Save before spending",
    description: "When you receive your allowance, transfer savings first. What's left is what you can spend.",
  },
  {
    icon: "📝",
    title: "Stick to your budget",
    description: "Track every expense, no matter how small. Small leaks sink big ships!",
  },
  {
    icon: "🍱",
    title: "Pack your lunch",
    description: "Bringing food from home can save you ₱50-100 daily. That's up to ₱2,000 a month!",
  },
  {
    icon: "🚶",
    title: "Walk when possible",
    description: "If the distance is walkable, save your jeepney fare. It's good for your wallet and health!",
  },
  {
    icon: "📱",
    title: "Review before buying",
    description: "Check if you really need it or just want it. Sleep on big purchases.",
  },
];

const disciplineRules = [
  { rule: "Track expenses daily", isFollowed: true },
  { rule: "Stay within budget categories", isFollowed: false },
  { rule: "Save at least 20% of allowance", isFollowed: true },
  { rule: "No impulse purchases", isFollowed: true },
  { rule: "Review spending weekly", isFollowed: false },
];

const Discipline = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [disciplineScore, setDisciplineScore] = useState(0);

  // Cycle through tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % dailyTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Animate discipline score
  useEffect(() => {
    const targetScore = 72;
    const duration = 1500;
    const steps = 60;
    const increment = targetScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setDisciplineScore(targetScore);
        clearInterval(timer);
      } else {
        setDisciplineScore(Math.round(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "danger":
        return "border-destructive/50 bg-destructive/5";
      case "warning":
        return "border-warning/50 bg-warning/5";
      case "success":
        return "border-success/50 bg-success/5";
    }
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <TrendingDown className="h-5 w-5 text-warning" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
    }
  };

  const followedRules = disciplineRules.filter(r => r.isFollowed).length;

  return (
    <UserLayout title="Spending Discipline" subtitle="Stay on track with your financial goals">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Discipline Score */}
            <Card className="animate-fade-in overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-success/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Discipline Score
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Based on your spending habits this month</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">{disciplineScore}%</div>
                    <div className="text-sm text-muted-foreground">Good Progress!</div>
                  </div>
                </div>
                <Progress value={disciplineScore} className="mt-4 h-3" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Flame className="h-4 w-4 text-warning" />
                  <span>Keep a 7-day streak to boost your score!</span>
                </div>
              </CardContent>
            </Card>

            {/* Alerts Section */}
            <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
                    <p>No active alerts. You're doing great!</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${getAlertStyles(alert.type)} transition-all hover:shadow-sm`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type)}
                          <div>
                            <h4 className="font-medium text-foreground">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                            {alert.percentage && (
                              <Progress value={alert.percentage} className="mt-2 h-2 w-32" />
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Rules Checklist */}
            <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Discipline Rules
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {followedRules}/{disciplineRules.length} followed
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {disciplineRules.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      item.isFollowed 
                        ? "border-success/30 bg-success/5" 
                        : "border-border bg-muted/30"
                    }`}
                  >
                    {item.isFollowed ? (
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                    )}
                    <span className={item.isFollowed ? "text-foreground" : "text-muted-foreground"}>
                      {item.rule}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Tips */}
          <div className="space-y-6">
            {/* Tip of the Day */}
            <Card className="animate-fade-in bg-gradient-to-br from-primary/5 to-success/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  Money Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  key={currentTipIndex}
                  className="animate-fade-in"
                >
                  <div className="text-4xl mb-3">{dailyTips[currentTipIndex].icon}</div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {dailyTips[currentTipIndex].title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {dailyTips[currentTipIndex].description}
                  </p>
                </div>
                <div className="flex justify-center gap-1 mt-4">
                  {dailyTips.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTipIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentTipIndex 
                          ? "bg-primary w-4" 
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* All Tips */}
            <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="text-lg">All Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyTips.map((tip, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setCurrentTipIndex(index)}
                  >
                    <span className="text-2xl">{tip.icon}</span>
                    <div>
                      <h5 className="font-medium text-sm text-foreground">{tip.title}</h5>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Discipline;
