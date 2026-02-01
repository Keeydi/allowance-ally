import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Video } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import type { VideoTip } from "./admin/AdminVideoTips";

const VideoTips = () => {
  const [videos, setVideos] = useState<VideoTip[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoTip | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const stored = localStorage.getItem("videoTips");
    if (stored) {
      setVideos(JSON.parse(stored));
    }
  }, []);

  const categories = ["All", ...Array.from(new Set(videos.map((v) => v.category)))];
  
  const filteredVideos = selectedCategory === "All" 
    ? videos 
    : videos.filter((v) => v.category === selectedCategory);

  return (
    <UserLayout title="Video Tips" subtitle="Learn budgeting and savings tips from our curated videos">

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <Card 
              key={video.id} 
              className="border-border/50 bg-card/50 overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative aspect-video bg-muted">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="h-8 w-8 text-primary-foreground ml-1" />
                  </div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{video.category}</span>
                </div>
                <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No videos available yet. Check back later!</p>
          </div>
        )}

        {/* Video Player Dialog */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{selectedVideo?.title}</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                {selectedVideo && (
                  <iframe
                    src={selectedVideo.videoUrl}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
              <p className="mt-4 text-muted-foreground">{selectedVideo?.description}</p>
            </div>
          </DialogContent>
        </Dialog>
    </UserLayout>
  );
};

export default VideoTips;
