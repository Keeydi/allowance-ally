import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: string;
  created_at: string;
  updated_at: string;
}

export const useBudgets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user,
  });

  // Get the allowance (stored as a special budget with category "allowance")
  const allowance = budgets.find(b => b.category === "allowance")?.amount || 0;
  
  // Get category allocations (excluding allowance)
  const allocations = budgets.filter(b => b.category !== "allowance");

  const upsertBudget = useMutation({
    mutationFn: async (budget: { category: string; amount: number; period?: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      // Check if budget for this category already exists
      const existing = budgets.find(b => b.category === budget.category);
      
      if (existing) {
        const { error } = await supabase
          .from("budgets")
          .update({ amount: budget.amount, period: budget.period || "monthly" })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("budgets")
          .insert({ 
            ...budget, 
            user_id: user.id,
            period: budget.period || "monthly"
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: (error) => {
      toast.error("Error saving budget: " + error.message);
    },
  });

  const setAllowance = useMutation({
    mutationFn: async (amount: number) => {
      if (!user) throw new Error("Not authenticated");
      
      const existing = budgets.find(b => b.category === "allowance");
      
      if (existing) {
        const { error } = await supabase
          .from("budgets")
          .update({ amount })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("budgets")
          .insert({ 
            category: "allowance", 
            amount, 
            user_id: user.id,
            period: "monthly"
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Allowance updated!");
    },
    onError: (error) => {
      toast.error("Error saving allowance: " + error.message);
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted!");
    },
    onError: (error) => {
      toast.error("Error deleting budget: " + error.message);
    },
  });

  return { 
    budgets, 
    allocations,
    allowance,
    isLoading, 
    upsertBudget, 
    setAllowance,
    deleteBudget 
  };
};
