import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface UserLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function UserLayout({ children, title, subtitle }: UserLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top bar with trigger */}
          <header className="sticky top-0 z-40 h-14 border-b border-border/50 bg-card/80 backdrop-blur-md flex items-center px-4 gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
