import { Wallet, PiggyBank, TrendingUp, Shield, Target, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Track Allowance",
    description: "Log your daily, weekly, or monthly allowance and see exactly where your money goes.",
  },
  {
    icon: BarChart3,
    title: "Plan Your Budget",
    description: "Allocate funds to needs, wants, and savings with easy percentage or fixed amounts.",
  },
  {
    icon: PiggyBank,
    title: "Build Savings",
    description: "Set savings goals with target dates and watch your progress with visual trackers.",
  },
  {
    icon: TrendingUp,
    title: "Track Expenses",
    description: "Categorize and filter your spending to understand your habits better.",
  },
  {
    icon: Shield,
    title: "Stay Disciplined",
    description: "Get alerts when you're overspending and tips to stay on track with your budget.",
  },
  {
    icon: Target,
    title: "Earn Achievements",
    description: "Unlock badges for good money habits and level up your financial discipline.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-card">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl mb-4">
            Everything You Need to{' '}
            <span className="text-gradient">Manage Money</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple tools designed for students to build smart financial habits from an early age.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:shadow-card hover:border-primary/20 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
