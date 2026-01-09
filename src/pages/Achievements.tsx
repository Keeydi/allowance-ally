import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Star, Medal, Target, Flame, Lock, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/Header";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  requirement?: string;
}

interface Level {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
}

const badges: Badge[] = [
  {
    id: "1",
    name: "First Steps",
    description: "Add your first expense",
    icon: "👣",
    isUnlocked: true,
    unlockedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "7-Day Streak",
    description: "Track expenses for 7 consecutive days",
    icon: "🔥",
    isUnlocked: true,
    unlockedDate: "2024-01-22",
  },
  {
    id: "3",
    name: "Budget Master",
    description: "Stay within budget for a full month",
    icon: "🎯",
    isUnlocked: false,
    progress: 75,
    requirement: "22/30 days within budget",
  },
  {
    id: "4",
    name: "Savings Starter",
    description: "Save ₱500 or more",
    icon: "🐷",
    isUnlocked: true,
    unlockedDate: "2024-01-20",
  },
  {
    id: "5",
    name: "Savings Pro",
    description: "Save ₱2,000 or more",
    icon: "💎",
    isUnlocked: false,
    progress: 40,
    requirement: "₱800/₱2,000 saved",
  },
  {
    id: "6",
    name: "No Impulse Hero",
    description: "Go 14 days without impulse purchases",
    icon: "🦸",
    isUnlocked: false,
    progress: 50,
    requirement: "7/14 days",
  },
  {
    id: "7",
    name: "Goal Getter",
    description: "Complete your first savings goal",
    icon: "🏆",
    isUnlocked: false,
    progress: 65,
    requirement: "₱1,300/₱2,000",
  },
  {
    id: "8",
    name: "30-Day Champion",
    description: "Track expenses for 30 consecutive days",
    icon: "👑",
    isUnlocked: false,
    progress: 23,
    requirement: "7/30 days",
  },
  {
    id: "9",
    name: "Smart Spender",
    description: "Keep 'Wants' under 20% of total spending",
    icon: "🧠",
    isUnlocked: true,
    unlockedDate: "2024-01-18",
  },
];

const levels: Level[] = [
  { level: 1, title: "Beginner Saver", minXP: 0, maxXP: 100, color: "bg-gray-400" },
  { level: 2, title: "Money Aware", minXP: 100, maxXP: 250, color: "bg-blue-400" },
  { level: 3, title: "Budget Builder", minXP: 250, maxXP: 500, color: "bg-green-400" },
  { level: 4, title: "Savings Star", minXP: 500, maxXP: 800, color: "bg-yellow-400" },
  { level: 5, title: "Finance Pro", minXP: 800, maxXP: 1200, color: "bg-purple-400" },
  { level: 6, title: "Money Master", minXP: 1200, maxXP: 1800, color: "bg-primary" },
];

const Achievements = () => {
  const [currentXP, setCurrentXP] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const targetXP = 420;
  const currentLevel = levels.find(l => targetXP >= l.minXP && targetXP < l.maxXP) || levels[0];
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
  const levelProgress = ((targetXP - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100;

  const unlockedBadges = badges.filter(b => b.isUnlocked);
  const lockedBadges = badges.filter(b => !b.isUnlocked);

  // Animate XP counter
  useEffect(() => {
    const duration = 2000;
    const steps = 100;
    const increment = targetXP / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetXP) {
        setCurrentXP(targetXP);
        clearInterval(timer);
      } else {
        setCurrentXP(Math.round(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
            <p className="text-muted-foreground text-sm">Track your financial discipline journey</p>
          </div>
        </div>

        {/* Level Card */}
        <Card className="mb-8 animate-fade-in overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 via-success/10 to-warning/20 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-full ${currentLevel.color} flex items-center justify-center text-white shadow-lg relative`}>
                  <span className="text-3xl font-bold">{currentLevel.level}</span>
                  <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-warning animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-warning" />
                    <span className="text-sm text-muted-foreground">Financial Discipline Level</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{currentLevel.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentXP} XP {nextLevel && `• ${nextLevel.minXP - targetXP} XP to ${nextLevel.title}`}
                  </p>
                </div>
              </div>
              
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Level {currentLevel.level}</span>
                  {nextLevel && <span>Level {nextLevel.level}</span>}
                </div>
                <div className="relative">
                  <Progress value={levelProgress} className="h-4" />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border-2 border-primary transition-all duration-1000"
                    style={{ left: `calc(${levelProgress}% - 6px)` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{unlockedBadges.length}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Flame className="h-5 w-5 text-warning" />
                  <span className="text-2xl font-bold text-warning">7</span>
                </div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">₱1,200</div>
                <div className="text-sm text-muted-foreground">Total Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Sections */}
        <div className="space-y-8">
          {/* Unlocked Badges */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Medal className="h-5 w-5 text-warning" />
              Earned Badges ({unlockedBadges.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedBadges.map((badge, index) => (
                <Card 
                  key={badge.id}
                  className="animate-fade-in border-success/30 bg-success/5 hover:shadow-card transition-all cursor-pointer group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl group-hover:scale-110 transition-transform">
                        {badge.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          {badge.name}
                          <Star className="h-4 w-4 text-warning fill-warning" />
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                        {badge.unlockedDate && (
                          <p className="text-xs text-success mt-2">
                            Unlocked {new Date(badge.unlockedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* In Progress / Locked Badges */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              In Progress ({lockedBadges.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedBadges.map((badge, index) => (
                <Card 
                  key={badge.id}
                  className="animate-fade-in border-border hover:border-primary/30 transition-all cursor-pointer group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl grayscale group-hover:grayscale-0 transition-all relative">
                        {badge.icon}
                        <div className="absolute -bottom-1 -right-1 bg-muted rounded-full p-0.5">
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                        {badge.progress !== undefined && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>{badge.requirement}</span>
                              <span>{badge.progress}%</span>
                            </div>
                            <Progress value={badge.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* How to Earn XP */}
        <Card className="mt-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              How to Earn XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { action: "Log an expense", xp: "+5 XP", icon: "📝" },
                { action: "Stay within daily budget", xp: "+10 XP", icon: "✅" },
                { action: "Complete a savings goal", xp: "+50 XP", icon: "🎯" },
                { action: "Maintain a 7-day streak", xp: "+25 XP", icon: "🔥" },
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.action}</p>
                    <p className="text-sm text-primary font-semibold">{item.xp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Achievements;
