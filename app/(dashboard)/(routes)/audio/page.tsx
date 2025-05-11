// app/(dashboard)/(routes)/audio/page.tsx
"use client";

import * as z from "zod";
import axios from "axios";
import { Headphones, Wand2, Sparkles, Info, Download, Music as MusicIcon, Share2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formSchema } from "./constants";
import { useProModal } from "@/hooks/use-pro-modal";
import { toast } from "sonner";

const AudioPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [audio, setAudio] = useState<string>();
  const [audioData, setAudioData] = useState<any>(null);
  const [showTips, setShowTips] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setAudio(undefined);
      setAudioData(null);
      
      const response = await axios.post("/api/audio", values);
      
      console.log("Audio generation response:", response.data);
      
      // Get the audio URL from the response
      const audioUrl = response.data.audioUrl || 
                     (response.data.audio) || 
                     (response.data.prediction && response.data.prediction.output && 
                      (response.data.prediction.output.audio || response.data.prediction.output));
      
      if (audioUrl) {
        setAudio(audioUrl);
        setAudioData(response.data);
        toast.success("Audio generated successfully!");
      } else {
        console.error("Could not find audio URL in response:", response.data);
        toast.error("Audio generated but URL not found");
      }
      
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        console.error("Error generating audio:", error);
        toast.error("Something went wrong generating your audio");
      }
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const copyAudioLink = () => {
    if (audio) {
      navigator.clipboard.writeText(audio);
      toast.success("Audio link copied to clipboard!");
    }
  };

  const promptExamples = [
    "Relaxing piano melody",
    "Upbeat electronic dance track",
    "Ambient nature sounds",
    "Classical orchestral piece",
    "Indie folk guitar composition"
  ];

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <Headphones className="mr-3 text-emerald-500" size={36} />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-green-500">
              AI Audio Generator
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create unique, AI-generated audio tailored to your imagination.
          </p>
        </div>

        <div className="text-center mb-6">
          <button 
            onClick={() => setShowTips(!showTips)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full flex items-center justify-center mx-auto"
          >
            <Info className="mr-2" size={20} />
            {showTips ? 'Hide' : 'Show'} Generation Tips
          </button>
        </div>

        {showTips && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8 text-center">
            <h3 className="text-2xl font-semibold mb-4 flex items-center justify-center">
              <Sparkles className="mr-2 text-yellow-500" size={24} />
              Pro Tips for Audio Generation
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div>
                <h4 className="font-bold mb-2">🎵 Be Specific</h4>
                <p className="text-gray-300">
                  Describe the mood, genre, and instruments you want to hear.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">🎹 Genre Guidance</h4>
                <p className="text-gray-300">
                  Mention specific music styles like jazz, electronic, or classical.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">🌈 Emotional Tone</h4>
                <p className="text-gray-300">
                  Include the emotional feel you're looking for (relaxing, energetic, etc.).
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">⏱️ Length Hint</h4>
                <p className="text-gray-300">
                  You can suggest the desired length or style of the audio.
                </p>
              </div>
            </div>
          </div>
        )}

        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-12 gap-4 mb-8"
        >
          <input 
            className="col-span-10 bg-gray-800 text-white p-3 rounded-lg"
            placeholder="Describe the audio you want to generate..."
            {...form.register("prompt")}
            disabled={isLoading}
          />

          <button 
            type="submit" 
            className="col-span-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white p-3 rounded-lg flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              <>
                <Wand2 className="mr-2" size={20} />
                Generate
              </>
            )}
          </button>
        </form>

        <div className="text-center mb-8">
          <p className="text-gray-400 mb-4">Need inspiration? Try one of these:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {promptExamples.map((example, index) => (
              <button 
                key={index}
                onClick={() => form.setValue('prompt', example)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-400">Generating your audio masterpiece...</p>
            <p className="text-gray-500 text-sm mt-2">This may take up to 30 seconds</p>
          </div>
        )}

        {audio && (
          <div className="mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4">Your Generated Audio</h2>
              <p className="text-gray-400 mb-6">Enjoy your AI-created audio masterpiece!</p>
            </div>
            
            <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg p-6">
              <audio 
                controls 
                className="w-full mb-4"
                src={audio}
              >
                Your browser does not support the audio element.
              </audio>
              
              {/* Audio URL display */}
              <div className="mt-4 mb-4 p-3 bg-gray-800 rounded-lg relative overflow-hidden">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Audio URL:</h4>
                <p className="text-xs text-gray-300 truncate pr-20">{audio}</p>
                <button 
                  onClick={copyAudioLink}
                  className="absolute right-2 top-2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md"
                  title="Copy to clipboard"
                >
                  <Share2 size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => window.open(audio, '_blank')}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-3 rounded-lg flex items-center justify-center"
                >
                  <Download className="mr-2" size={20} />
                  Download
                </button>
                
                <button 
                  onClick={() => form.reset()}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg flex items-center justify-center"
                >
                  <Wand2 className="mr-2" size={20} />
                  New Generation
                </button>
              </div>
            </div>
            
            {audioData && audioData.prediction && (
              <div className="max-w-2xl mx-auto mt-6 bg-gray-900 rounded-lg p-6">
                <h3 className="font-bold mb-3 text-lg">Generation Details</h3>
                <div className="text-sm text-gray-400">
                  <p className="mb-2"><span className="font-semibold">Prompt:</span> {audioData.usedPrompt || form.getValues().prompt}</p>
                  {audioData.prediction.model && (
                    <p className="mb-2"><span className="font-semibold">Model:</span> {audioData.modelType || audioData.prediction.model}</p>
                  )}
                  {audioData.prediction.metrics && audioData.prediction.metrics.predict_time && (
                    <p className="mb-2"><span className="font-semibold">Generation Time:</span> {audioData.prediction.metrics.predict_time.toFixed(1)}s</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPage;