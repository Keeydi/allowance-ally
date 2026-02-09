import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const canSubmit = useMemo(() => {
    return password.length >= 6 && password === confirmPassword;
  }, [password, confirmPassword]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({
          title: "Could not update password",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
      navigate("/login", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="container pt-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
            <p className="mt-2 text-muted-foreground">
              Enter a new password for your account.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                variant="cta"
                className="w-full h-11"
                disabled={!canSubmit || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update password"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              If you opened this page without using a reset link, request a password reset from the login page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
