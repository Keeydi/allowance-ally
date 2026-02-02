import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface VideoTip {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail: string | null;
  category: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useVideoTips = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["video_tips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_tips")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as VideoTip[];
    },
    enabled: !!user,
  });

  const addVideo = useMutation({
    mutationFn: async (video: Omit<VideoTip, "id" | "created_at" | "updated_at" | "created_by">) => {
      // UI-only check for better UX - actual authorization enforced by RLS policies
      // The database will reject this request if the user is not an admin
      if (!user || !isAdmin) throw new Error("Not authorized");
      const { data, error } = await supabase
        .from("video_tips")
        .insert({ ...video, created_by: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video_tips"] });
      toast({ title: "Video added successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error adding video", description: error.message, variant: "destructive" });
    },
  });

  const updateVideo = useMutation({
    mutationFn: async ({ id, ...video }: Partial<VideoTip> & { id: string }) => {
      const { error } = await supabase.from("video_tips").update(video).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video_tips"] });
      toast({ title: "Video updated!" });
    },
    onError: (error) => {
      toast({ title: "Error updating video", description: error.message, variant: "destructive" });
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("video_tips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video_tips"] });
      toast({ title: "Video deleted!" });
    },
    onError: (error) => {
      toast({ title: "Error deleting video", description: error.message, variant: "destructive" });
    },
  });

  return { videos, isLoading, addVideo, updateVideo, deleteVideo };
};
