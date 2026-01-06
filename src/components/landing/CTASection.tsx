import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl mb-4">
            Ready to Take Control of Your Money?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join hundreds of students who are building smart money habits with Budget Buddy. It's completely free!
          </p>
          <Link to="/login">
            <Button 
              variant="secondary" 
              size="xl"
              className="bg-white text-primary hover:bg-white/90 shadow-elevated"
            >
              Start Budgeting Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
