import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, TrendingUp, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to admin dashboard, don't logout
    navigate("/admin");
  };

  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, color: "text-primary" },
    { label: "Video Tips", value: "48", icon: Video, color: "text-emerald-500" },
    { label: "Active This Week", value: "892", icon: TrendingUp, color: "text-amber-500" },
    { label: "Feedback Received", value: "156", icon: MessageSquare, color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogoClick}
              className="text-xl font-bold text-foreground hover:opacity-80 transition-opacity"
            >
              Budget<span className="text-primary">Buddy</span>
              <span className="ml-2 text-sm font-normal text-muted-foreground">Admin</span>
            </button>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/admin" className="text-sm font-medium text-foreground">Dashboard</Link>
            <Link to="/admin/users" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Users</Link>
            <Link to="/admin/video-tips" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Video Tips</Link>
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">User Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your BudgetBuddy platform</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/video-tips" className="block p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Manage Video Tips</p>
                    <p className="text-sm text-muted-foreground">Add, edit, or remove educational videos</p>
                  </div>
                </div>
              </Link>
              <Link to="/admin/users" className="block p-4 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-medium text-foreground">View Users</p>
                    <p className="text-sm text-muted-foreground">See registered users and their activity</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New user registered", time: "2 minutes ago" },
                  { action: "Video tip uploaded", time: "1 hour ago" },
                  { action: "Feedback submitted", time: "3 hours ago" },
                  { action: "Budget goal achieved", time: "5 hours ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-foreground">{activity.action}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
