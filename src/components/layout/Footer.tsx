import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Budget<span className="text-primary">Buddy</span>
            </span>
          </Link>

          <p className="text-sm text-muted-foreground text-center">
            A student-designed budgeting tool for Grade 11 learners.
          </p>

          <p className="text-sm text-muted-foreground">
            © 2026 Budget Buddy. Made with 💚
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
