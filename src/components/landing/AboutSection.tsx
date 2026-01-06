import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const benefits = [
  "Track your allowance and expenses easily",
  "Plan your budget wisely with categories",
  "Build healthy saving habits early",
  "Control unnecessary spending",
  "Get insights into your money behavior",
  "Earn achievements for good habits",
];

const monthlyData = [
  { allowance: 2500, spent: 1850, remaining: 650, percent: 74 },
  { allowance: 3000, spent: 2100, remaining: 900, percent: 70 },
  { allowance: 2000, spent: 1200, remaining: 800, percent: 60 },
  { allowance: 2800, spent: 2400, remaining: 400, percent: 86 },
];

const AnimatedNumber = ({ value, prefix = "₱" }: { value: number; prefix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{displayValue.toLocaleString()}
    </span>
  );
};

const AboutSection = () => {
  const [dataIndex, setDataIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentData = monthlyData[dataIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setDataIndex((prev) => (prev + 1) % monthlyData.length);
        setIsTransitioning(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="about" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground mb-6 animate-fade-up">
              About Budget Buddy
            </div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Built by Students,{' '}
              <span className="text-gradient">For Students</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Budget Buddy is a student-designed budgeting website created to help Grade 11 learners become more disciplined and responsible in managing their allowance. We understand the challenges of balancing wants and needs on a limited budget.
            </p>
            
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li 
                  key={benefit} 
                  className="flex items-start gap-3 animate-fade-up"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual - Animated Dashboard Preview */}
          <div className="relative animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative rounded-2xl bg-gradient-card border border-border p-8 shadow-elevated hover:shadow-glow transition-shadow duration-500">
              {/* Mock Dashboard Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">This Month's Overview</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    January 2026
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-xl bg-success-light p-4 transition-all duration-300 ${isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                    <p className="text-xs text-muted-foreground mb-1">Allowance</p>
                    <p className="text-xl font-bold text-foreground">
                      <AnimatedNumber value={currentData.allowance} />
                    </p>
                  </div>
                  <div className={`rounded-xl bg-warning-light p-4 transition-all duration-300 ${isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                    <p className="text-xs text-muted-foreground mb-1">Spent</p>
                    <p className="text-xl font-bold text-foreground">
                      <AnimatedNumber value={currentData.spent} />
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget Used</span>
                    <span className={`font-medium text-foreground transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                      {currentData.percent}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-primary transition-all duration-1000 ease-out"
                      style={{ width: `${currentData.percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className={`text-lg font-bold text-primary transition-all duration-300 ${isTransitioning ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}`}>
                      <AnimatedNumber value={currentData.remaining} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements with animation */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-accent/10 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
