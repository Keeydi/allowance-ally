import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Track your allowance and expenses easily",
  "Plan your budget wisely with categories",
  "Build healthy saving habits early",
  "Control unnecessary spending",
  "Get insights into your money behavior",
  "Earn achievements for good habits",
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground mb-6">
              About Budget Buddy
            </div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl mb-6">
              Built by Students,{' '}
              <span className="text-gradient">For Students</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Budget Buddy is a student-designed budgeting website created to help Grade 11 learners become more disciplined and responsible in managing their allowance. We understand the challenges of balancing wants and needs on a limited budget.
            </p>
            
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative rounded-2xl bg-gradient-card border border-border p-8 shadow-elevated">
              {/* Mock Dashboard Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">This Month's Overview</span>
                  <span className="text-xs text-muted-foreground">January 2026</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-success-light p-4">
                    <p className="text-xs text-muted-foreground mb-1">Allowance</p>
                    <p className="text-xl font-bold text-foreground">₱2,500</p>
                  </div>
                  <div className="rounded-xl bg-warning-light p-4">
                    <p className="text-xs text-muted-foreground mb-1">Spent</p>
                    <p className="text-xl font-bold text-foreground">₱1,850</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget Used</span>
                    <span className="font-medium text-foreground">74%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[74%] rounded-full bg-gradient-primary" />
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className="text-lg font-bold text-primary">₱650</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
