import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminUser {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  role: "admin" | "user";
  total_savings: number;
  total_expenses: number;
}

export const useAdminUsers = () => {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Fetch all profiles (admin RLS allows this)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Fetch savings goals totals per user
      const { data: savings, error: savingsError } = await supabase
        .from("savings_goals")
        .select("user_id, current_amount");

      if (savingsError) throw savingsError;

      // Fetch expenses totals per user
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("user_id, amount");

      if (expensesError) throw expensesError;

      // Map profiles with their roles and totals
      const usersWithData: AdminUser[] = profiles.map((profile) => {
        const userRole = roles.find((r) => r.user_id === profile.user_id);
        const userSavings = savings
          .filter((s) => s.user_id === profile.user_id)
          .reduce((acc, s) => acc + Number(s.current_amount), 0);
        const userExpenses = expenses
          .filter((e) => e.user_id === profile.user_id)
          .reduce((acc, e) => acc + Number(e.amount), 0);

        return {
          id: profile.id,
          user_id: profile.user_id,
          display_name: profile.display_name,
          created_at: profile.created_at,
          role: (userRole?.role as "admin" | "user") || "user",
          total_savings: userSavings,
          total_expenses: userExpenses,
        };
      });

      return usersWithData;
    },
  });

  return { users, isLoading, error };
};
