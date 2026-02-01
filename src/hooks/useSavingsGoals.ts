import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export const useSavingsGoals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["savings_goals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SavingsGoal[];
    },
    enabled: !!user,
  });

  const addGoal = useMutation({
    mutationFn: async (goal: Omit<SavingsGoal, "id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("savings_goals")
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings_goals"] });
      toast({ title: "Savings goal added!" });
    },
    onError: (error) => {
      toast({ title: "Error adding goal", description: error.message, variant: "destructive" });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...goal }: Partial<SavingsGoal> & { id: string }) => {
      const { error } = await supabase.from("savings_goals").update(goal).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings_goals"] });
      toast({ title: "Goal updated!" });
    },
    onError: (error) => {
      toast({ title: "Error updating goal", description: error.message, variant: "destructive" });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("savings_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings_goals"] });
      toast({ title: "Goal deleted!" });
    },
    onError: (error) => {
      toast({ title: "Error deleting goal", description: error.message, variant: "destructive" });
    },
  });

  return { goals, isLoading, addGoal, updateGoal, deleteGoal };
};
