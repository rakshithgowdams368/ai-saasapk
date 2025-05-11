// File path: app/(dashboard)/(routes)/video/page.tsx
"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { VideoIcon, Library, Download, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { useProModal } from "@/hooks/use-pro-modal";
import { toast } from "sonner";

import { formSchema } from "./constants";

const VideoPage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [video, setVideo] = useState<string>();
  const [videoData, setVideoData] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setVideo(undefined);
      setVideoData(null);

      const response = await axios.post("/api/video", values);

      console.log("API Response:", response.data); // Debug logging

      // Check if the response contains the video URL directly
      if (response.data && response.data.videoUrl) {
        setVideo(response.data.videoUrl);

        // Store full prediction data if available
        if (response.data.prediction) {
          setVideoData(response.data.prediction);
        }

        toast.success(response.data.message || "Video generated successfully!");
      } else if (response.data && response.data.video && response.data.video.output) {
        // Fallback for older API format
        setVideo(response.data.video.output);
        setVideoData(response.data.video);
        toast.success("Video generated successfully!");
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        // Handle the very old response format
        setVideo(response.data[0]);
        toast.success("Video generated successfully!");
      } else {
        console.error("Unknown API response format:", response.data);
        toast.error("Received unexpected response format");
      }

      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
        console.error("Video generation error:", error);
      }
    } finally {
      router.refresh();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="p-2 w-fit rounded-md bg-orange-700/10">
            <VideoIcon className="w-10 h-10 text-orange-700" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Video Generation</h2>
            <p className="text-muted-foreground text-sm">
              Turn your prompt into video.
            </p>
          </div>
        </div>
        {/*<Link href="/video/library">
          <Button variant="outline" className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            My Videos
          </Button>
        </Link>*/}
      </div>
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border border-gray-700 w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="Clown fish swimming in a coral reef"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              className="col-span-12 lg:col-span-2 w-full"
              type="submit"
              disabled={isLoading}
              size="icon"
            >
              Generate
            </Button>
          </form>
        </Form>

        {/* Enhanced Prompt Tips */}
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg text-sm">
          <p className="text-white font-medium mb-1">Pro Tips for Better Videos:</p>
          <p className="text-gray-400">
            Add style keywords (anime, cartoon, cinematic), settings (beach, forest, space),
            time of day (sunset, night), or motion (running, swimming) to enhance your results.
          </p>
        </div>

        {isLoading && (
          <div className="p-20">
            <Loader />
            <p className="text-center text-muted-foreground mt-4">
              Generating your video... This may take 1-2 minutes
            </p>
          </div>
        )}

        {!video && !isLoading && (
          <Empty label="No video files generated." />
        )}

        {video && (
          <div className="mt-8 space-y-4">
            {/* Video Direct Link - Prominently displayed */}
            <div className="bg-orange-700/20 border border-orange-600/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Download className="w-5 h-5 mr-2 text-orange-500" />
                  Your Video Link
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(video)}
                    variant="outline"
                    size="sm"
                    className="h-8 border-orange-600/50 hover:bg-orange-800/20"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </Button>
                  <a
                    href={video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center justify-center rounded-md bg-orange-700 px-3 text-xs font-medium text-white shadow transition-colors hover:bg-orange-600"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Open
                  </a>
                </div>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-md text-orange-100 break-all text-sm font-mono">
                {video}
              </div>
              <p className="text-orange-200/70 text-sm mt-2">
                You can download this video or share the link directly. The video will remain available at this URL.
              </p>
            </div>

            <video controls className="w-full aspect-video rounded-lg border bg-black">
              <source src={video} />
            </video>

            {/* Video Details Card */}
            {videoData && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Video Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-400">Status: <span className="text-white">{videoData.status || "Completed"}</span></p>
                    <p className="text-gray-400">Created: <span className="text-white">
                      {videoData.created_at ? new Date(videoData.created_at).toLocaleString() : "Now"}
                    </span></p>
                    {videoData.metrics && (
                      <p className="text-gray-400">Generation Time: <span className="text-white">
                        {videoData.metrics.predict_time ? `${videoData.metrics.predict_time.toFixed(1)}s` : "N/A"}
                      </span></p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400">Prompt: <span className="text-white">{videoData.input?.prompt || form.getValues().prompt}</span></p>
                    <p className="text-gray-400">Model: <span className="text-white">
                      {videoData.model || "videocrafter"}
                    </span></p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => router.push('/video/library')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Library className="w-4 h-4" />
                View in Library
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;