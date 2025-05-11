// File path: app/(dashboard)/(routes)/video/library/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { VideoIcon, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/empty";
import { format } from "date-fns";
import Link from "next/link";

interface Video {
  id: string;
  prompt: string;
  videoUrl: string;
  duration: number;
  createdAt: string;
  metadata: {
    model: string;
    resolution: string;
    fps: number;
  };
}

const VideoLibraryPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/video/user-videos");
        console.log("API response:", response.data);
        setVideos(response.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setError("Failed to load your videos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="p-2 w-fit rounded-md bg-orange-700/10">
            <VideoIcon className="w-10 h-10 text-orange-700" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">My Video Library</h2>
            <p className="text-muted-foreground text-sm">
              View your generated videos
            </p>
          </div>
        </div>
        <Link href="/video">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Generator
          </Button>
        </Link>
      </div>

      <div className="px-4 lg:px-8">
        {isLoading && (
          <div className="p-20">
            <Loader />
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!isLoading && !error && videos.length === 0 && (
          <Empty 
            label="You haven't generated any videos yet." 
            action={
              <Link href="/video">
                <Button>Generate your first video</Button>
              </Link>
            }
          />
        )}

        {videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden bg-slate-900 border border-slate-800">
                <div className="relative aspect-video">
                  <video 
                    className="w-full h-full object-cover rounded-t-lg"
                    controls
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                  </video>
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {video.duration}s
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white line-clamp-1">{video.prompt}</h3>
                  <div className="mt-2 text-xs text-gray-400">
                    {video.createdAt ? format(new Date(video.createdAt), "MMM d, yyyy") : ""}
                    {" • "}{video.metadata?.resolution || "576x320"}
                    {" • "}{video.metadata?.fps || 8}fps
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(video.videoUrl, "_blank")}
                  >
                    View Full Size
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoLibraryPage;