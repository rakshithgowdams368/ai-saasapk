"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ImageGenerationTips } from "@/components/image-generation-tips";
import { ExternalLink, Copy, Check } from "lucide-react";
import {
  amountOptions,
  resolutionOptions,
  modelOptions
} from "./constants";

export default function ImageGeneration2Page() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [amount, setAmount] = useState("1");
  const [resolution, setResolution] = useState("1024x1024");
  const [model, setModel] = useState("free-model-basic");
  const [promptError, setPromptError] = useState("");

  // Function to copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!prompt.trim()) {
      setPromptError("Image prompt is required");
      return;
    } else {
      setPromptError("");
    }

    try {
      setIsLoading(true);
      setImages([]);
      setError("");
      setDebug(null);

      const requestData = {
        prompt,
        amount,
        resolution,
        model,
      };

      console.log("Submitting request with:", requestData);

      const response = await axios.post("/api/image-2", requestData);

      console.log("API Response:", response.data);

      // Store debug information
      setDebug(response.data);

      // Extract URLs from response
      if (response.data.output && Array.isArray(response.data.output)) {
        setImages(response.data.output);
      } else if (response.data.urls && Array.isArray(response.data.urls)) {
        setImages(response.data.urls);
      } else {
        console.warn("No image URLs found in response:", response.data);
        setError("No images were generated. Please try again.");
      }

      // Only clear prompt if successful
      if (response.data.success) {
        setPrompt("");
      }
    } catch (error) {
      console.error("Error generating images:", error);

      // More detailed error message
      if (axios.isAxiosError(error)) {
        const serverErrorMessage = error.response?.data?.message || error.message;
        setError(`Error: ${serverErrorMessage}`);

        // Store error details for debugging
        setDebug({
          error: true,
          message: serverErrorMessage,
          response: error.response?.data,
          status: error.response?.status
        });
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="px-4 lg:px-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Image Generation 2</h1>
        <p className="text-sm text-muted-foreground">
          Enhanced image creation with advanced models and resolution control
        </p>
      </div>
      <div className="mx-auto max-w-4xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Add the Tips Component */}
        <ImageGenerationTips />

        <Card>
          <CardHeader>
            <CardTitle>Generate Advanced Images</CardTitle>
            <CardDescription>
              Create stunning visuals with enhanced AI image generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Prompt
                </label>
                <Input
                  placeholder="A futuristic cityscape at sunset..."
                  disabled={isLoading}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                {promptError && (
                  <p className="text-sm text-red-500">{promptError}</p>
                )}
                <p className="text-sm text-gray-500">
                  Describe the image you want to generate in detail
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Number of images
                  </label>
                  <Select
                    disabled={isLoading}
                    value={amount}
                    onValueChange={setAmount}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select amount" />
                    </SelectTrigger>
                    <SelectContent>
                      {amountOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Resolution
                  </label>
                  <Select
                    disabled={isLoading}
                    value={resolution}
                    onValueChange={setResolution}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      {resolutionOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Model
                  </label>
                  <Select
                    disabled={isLoading}
                    value={model}
                    onValueChange={setModel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Generating..." : "Generate Images"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="p-8 rounded-lg w-full flex items-center justify-center">
            <div className="h-full flex flex-col gap-y-4 items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-sm text-muted-foreground">
                Processing... This may take up to 1 minute.
              </p>
            </div>
          </div>
        )}

        {images.length === 0 && !isLoading && (
          <div className="h-full p-20 flex flex-col items-center justify-center">
            <div className="relative h-40 w-40 opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm text-center">
              No images generated yet.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {images.map((src, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative aspect-square">
                <img
                  alt={`Generated image ${index + 1}`}
                  src={src}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error("Image failed to load:", src);
                    target.src = "https://picsum.photos/seed/error/512/512"; // Fallback on error
                    target.alt = "Error loading image";
                  }}
                />
              </div>
              <CardFooter className="p-2 flex flex-col gap-2">
                <Button
                  onClick={() => window.open(src, "_blank")}
                  variant="secondary"
                  className="w-full"
                >
                  View Full Size
                </Button>
                <div className="text-xs text-gray-500 break-all overflow-hidden">
                  {typeof src === 'string' &&
                    `${src.substring(0, 30)}...${src.substring(src.length - 10)}`}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Debug Information with Image Preview - Inline Version */}
        {debug && debug.output && debug.output[0] && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Debug Information</h3>

            <Card className="mb-5 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image Preview */}
                <div className="w-full md:w-1/2 h-64 relative">
                  <img
                    src={debug.output[0]}
                    alt="Generated image"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://picsum.photos/seed/error/512/512";
                      target.alt = "Error loading image";
                    }}
                  />
                </div>

                {/* Image URL Info */}
                <div className="w-full md:w-1/2 p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-medium mb-2">Image URL</h4>
                    <div className="relative">
                      <pre className="text-xs bg-gray-500 p-4 rounded overflow-auto max-h-30 break-all">
                        {debug.output[0]}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-[-10px] right-1"
                        onClick={() => copyToClipboard(debug.output[0])}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(debug.output[0], '_blank')}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Image
                    </Button>

                    {debug.urls?.stream && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(debug.urls.stream, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Stream
                      </Button>
                    )}
                  </div>
                  <br />
                </div>
                <br />
              </div>
            </Card>
            <br />
          </div>
        )}
      </div>
    </div>
  );
}