import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export interface VideoTip {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  category: string;
  createdAt: string;
}

const defaultVideos: VideoTip[] = [
  {
    id: "1",
    title: "50/30/20 Budgeting Rule Explained",
    description: "Learn the popular 50/30/20 budgeting method to manage your money effectively.",
    videoUrl: "https://www.youtube.com/embed/HQzoZfc3GwQ",
    thumbnail: "https://img.youtube.com/vi/HQzoZfc3GwQ/maxresdefault.jpg",
    category: "Budgeting",
    createdAt: "2025-01-05",
  },
  {
    id: "2",
    title: "How to Start an Emergency Fund",
    description: "Essential tips for building your emergency savings from scratch.",
    videoUrl: "https://www.youtube.com/embed/fVToMS2Q3XQ",
    thumbnail: "https://img.youtube.com/vi/fVToMS2Q3XQ/maxresdefault.jpg",
    category: "Savings",
    createdAt: "2025-01-08",
  },
  {
    id: "3",
    title: "Track Your Daily Expenses",
    description: "Simple methods to track and reduce your daily spending habits.",
    videoUrl: "https://www.youtube.com/embed/sVKQn2I4HDM",
    thumbnail: "https://img.youtube.com/vi/sVKQn2I4HDM/maxresdefault.jpg",
    category: "Expenses",
    createdAt: "2025-01-10",
  },
];

const AdminVideoTips = () => {
  const [videos, setVideos] = useState<VideoTip[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoTip | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    category: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("videoTips");
    if (stored) {
      setVideos(JSON.parse(stored));
    } else {
      setVideos(defaultVideos);
      localStorage.setItem("videoTips", JSON.stringify(defaultVideos));
    }
  }, []);

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoId = extractVideoId(formData.videoUrl);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : formData.videoUrl;
    const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "";

    if (editingVideo) {
      const updated = videos.map((v) =>
        v.id === editingVideo.id
          ? { ...v, ...formData, videoUrl: embedUrl, thumbnail }
          : v
      );
      setVideos(updated);
      localStorage.setItem("videoTips", JSON.stringify(updated));
      toast({ title: "Video updated successfully!" });
    } else {
      const newVideo: VideoTip = {
        id: Date.now().toString(),
        ...formData,
        videoUrl: embedUrl,
        thumbnail,
        createdAt: new Date().toISOString().split("T")[0],
      };
      const updated = [...videos, newVideo];
      setVideos(updated);
      localStorage.setItem("videoTips", JSON.stringify(updated));
      toast({ title: "Video added successfully!" });
    }

    setFormData({ title: "", description: "", videoUrl: "", category: "" });
    setEditingVideo(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (video: VideoTip) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      category: video.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    localStorage.setItem("videoTips", JSON.stringify(updated));
    toast({ title: "Video deleted successfully!" });
  };

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
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Exit Admin</Link>
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
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingVideo ? "Update Video" : "Add Video"}
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
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(video.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{video.category}</span>
                  <span className="text-xs text-muted-foreground">{video.createdAt}</span>
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
