import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalUsers: number;
  totalVideoTips: number;
  totalFeedback: number;
  activeThisWeek: number;
}

export const useAdminStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<AdminStats> => {
      // Get total users count
      const { count: usersCount, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (usersError) throw usersError;

      // Get total video tips count
      const { count: videosCount, error: videosError } = await supabase
        .from("video_tips")
        .select("*", { count: "exact", head: true });

      if (videosError) throw videosError;

      // Get total feedback count
      const { count: feedbackCount, error: feedbackError } = await supabase
        .from("feedback")
        .select("*", { count: "exact", head: true });

      if (feedbackError) throw feedbackError;

      // Get users active this week (who have expenses in the last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: activeUsers, error: activeError } = await supabase
        .from("expenses")
        .select("user_id")
        .gte("created_at", oneWeekAgo.toISOString());

      if (activeError) throw activeError;

      // Get unique active users
      const uniqueActiveUsers = new Set(activeUsers?.map((e) => e.user_id) || []);

      return {
        totalUsers: usersCount || 0,
        totalVideoTips: videosCount || 0,
        totalFeedback: feedbackCount || 0,
        activeThisWeek: uniqueActiveUsers.size,
      };
    },
  });

  return { stats, isLoading, error };
};
