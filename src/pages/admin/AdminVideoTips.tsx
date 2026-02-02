import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Video, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useVideoTips } from "@/hooks/useVideoTips";
import { toast } from "@/hooks/use-toast";

const AdminVideoTips = () => {
  const { videos, isLoading, addVideo, updateVideo, deleteVideo } = useVideoTips();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<typeof videos[0] | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    category: "",
  });

  // SECURITY: Allowlist of trusted video platform domains
  const ALLOWED_VIDEO_DOMAINS = ['youtube.com', 'youtu.be', 'vimeo.com', 'player.vimeo.com'];

  const isValidVideoUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ALLOWED_VIDEO_DOMAINS.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const extractVimeoId = (url: string) => {
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // SECURITY: Validate URL is from trusted video platforms only
    if (!isValidVideoUrl(formData.videoUrl)) {
      toast({
        title: "Invalid video URL",
        description: "Please enter a valid YouTube or Vimeo URL",
        variant: "destructive"
      });
      return;
    }
    
    const youtubeId = extractVideoId(formData.videoUrl);
    const vimeoId = extractVimeoId(formData.videoUrl);
    
    let embedUrl: string;
    let thumbnail: string | null = null;
    
    if (youtubeId) {
      embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
      thumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    } else if (vimeoId) {
      embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
      thumbnail = null; // Vimeo thumbnails require API access
    } else {
      // This shouldn't happen due to validation above, but fallback safely
      toast({
        title: "Unsupported video format",
        description: "Please use a standard YouTube or Vimeo video URL",
        variant: "destructive"
      });
      return;
    }

    if (editingVideo) {
      updateVideo.mutate({
        id: editingVideo.id,
        title: formData.title,
        description: formData.description,
        video_url: embedUrl,
        thumbnail,
        category: formData.category,
      });
    } else {
      addVideo.mutate({
        title: formData.title,
        description: formData.description,
        video_url: embedUrl,
        thumbnail,
        category: formData.category,
      });
    }

    setFormData({ title: "", description: "", videoUrl: "", category: "" });
    setEditingVideo(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (video: typeof videos[0]) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      videoUrl: video.video_url,
      category: video.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteVideo.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-foreground">
              Budget<span className="text-primary">Buddy</span>
              <span className="ml-2 text-sm font-normal text-muted-foreground">Admin</span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            <Link to="/admin/users" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Users</Link>
            <Link to="/admin/video-tips" className="text-sm font-medium text-foreground">Video Tips</Link>
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Exit Admin</Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Video Tips Management</h1>
            <p className="text-muted-foreground mt-1">Add educational videos for users</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingVideo(null); setFormData({ title: "", description: "", videoUrl: "", category: "" }); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingVideo ? "Edit Video" : "Add New Video"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter video title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Budgeting, Savings, Tips"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl">YouTube URL</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the video"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={addVideo.isPending || updateVideo.isPending}
                >
                  {(addVideo.isPending || updateVideo.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingVideo ? (
                    "Update Video"
                  ) : (
                    "Add Video"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="border-border/50 bg-card/50 overflow-hidden group">
              <div className="relative aspect-video bg-muted">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(video)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDelete(video.id)}
                    disabled={deleteVideo.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{video.category}</span>
                  <span className="text-xs text-muted-foreground">{new Date(video.created_at).toLocaleDateString()}</span>
                </div>
                <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No videos added yet. Click "Add Video" to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminVideoTips;
