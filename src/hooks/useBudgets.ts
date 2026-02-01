import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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

  const addBudget = useMutation({
    mutationFn: async (budget: Omit<Budget, "id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("budgets")
        .insert({ ...budget, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({ title: "Budget added successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error adding budget", description: error.message, variant: "destructive" });
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...budget }: Partial<Budget> & { id: string }) => {
      const { error } = await supabase.from("budgets").update(budget).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({ title: "Budget updated!" });
    },
    onError: (error) => {
      toast({ title: "Error updating budget", description: error.message, variant: "destructive" });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({ title: "Budget deleted!" });
    },
    onError: (error) => {
      toast({ title: "Error deleting budget", description: error.message, variant: "destructive" });
    },
  });

  return { budgets, isLoading, addBudget, updateBudget, deleteBudget };
};
