"use client";

import { useState } from "react";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ImageGenerationTips = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card className="mb-6 bg-amber-50 border-amber-200">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg text-amber-700">Tips for better images</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0 rounded-full"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-amber-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-amber-700" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 px-4 pb-4 text-amber-800">
          <div className="space-y-2 text-sm">
            <p className="font-medium">To get the best results:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Be specific about what you want to see</li>
              <li>Include details about style, lighting, and composition</li>
              <li>Specify camera angles (e.g., "aerial view", "close-up")</li>
              <li>Mention art styles (e.g., "watercolor", "photorealistic")</li>
              <li>Include time of day for outdoor scenes (e.g., "sunset", "night")</li>
            </ul>
            
            <p className="font-medium mt-3">Examples of good prompts:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-medium">Simple:</span> "Mountain landscape during sunset"
              </li>
              <li>
                <span className="font-medium">Better:</span> "Majestic snow-capped mountains during golden sunset, clear sky, reflections in a calm lake, photorealistic"
              </li>
              <li>
                <span className="font-medium">Advanced:</span> "Wide-angle shot of jagged mountains at sunset, golden hour lighting, dramatic shadows, crisp air, pristine alpine lake in foreground with perfect reflections, wispy clouds, vibrant colors, 8K, professional photography"
              </li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
};