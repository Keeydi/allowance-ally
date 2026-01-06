import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
      {/* Background decoration with animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/3 blur-3xl animate-pulse" style={{ animationDelay: '0.75s' }} />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-3 h-3 rounded-full bg-primary/20 animate-float" />
        <div className="absolute top-40 right-[15%] w-2 h-2 rounded-full bg-accent/30 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-[20%] w-4 h-4 rounded-full bg-primary/15 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-[25%] w-2 h-2 rounded-full bg-accent/25 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground animate-fade-up hover:scale-105 transition-transform cursor-default">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Made by students, for students</span>
          </div>

          {/* Main heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Take Control of Your{' '}
            <span className="text-gradient relative">
              Allowance
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-primary rounded-full animate-scale-x" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Budget Buddy helps you track spending, build savings habits, and become financially responsible — all in one simple app.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/login">
              <Button variant="hero" size="xl" className="group">
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="hover:scale-105 transition-transform">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: "100%", label: "Free to Use" },
              { value: "Easy", label: "To Learn" },
              { value: "Smart", label: "Money Habits" },
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center group hover:scale-110 transition-transform cursor-default"
              >
                <div className="text-2xl font-bold text-primary md:text-3xl group-hover:animate-pulse">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
