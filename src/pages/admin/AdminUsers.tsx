import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "Active", joined: "2025-01-01", savings: "₱12,500" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Active", joined: "2025-01-03", savings: "₱8,200" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", status: "Inactive", joined: "2025-01-05", savings: "₱3,100" },
  { id: 4, name: "Sarah Williams", email: "sarah@example.com", status: "Active", joined: "2025-01-07", savings: "₱15,800" },
  { id: 5, name: "Chris Brown", email: "chris@example.com", status: "Active", joined: "2025-01-10", savings: "₱6,400" },
];

const AdminUsers = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-foreground">
              Budget<span className="text-primary">Buddy</span>
              <span className="ml-2 text-sm font-normal text-muted-foreground">Admin</span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            <Link to="/admin/users" className="text-sm font-medium text-foreground">Users</Link>
            <Link to="/admin/video-tips" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Video Tips</Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Exit Admin</Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">View and manage registered users</p>
        </div>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>All Users ({mockUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Total Savings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.joined}</TableCell>
                    <TableCell className="text-right font-medium text-primary">{user.savings}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminUsers;
