// app/(dashboard)/(routes)/image-2/constants.ts
import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Image prompt is required",
  }),
  amount: z.string().min(1),
  resolution: z.string().min(1),
  model: z.string().min(1),
});

export const amountOptions = [
  { value: "1", label: "1 Photo" },
  { value: "2", label: "2 Photos" },
  { value: "3", label: "3 Photos" },
  { value: "4", label: "4 Photos" },
];

// Updated to support standard aspect ratios that work well with placeholder services
export const resolutionOptions = [
  { value: "512x512", label: "Small (512x512)" },
  { value: "1024x1024", label: "Standard (1024x1024)" },
  { value: "1024x768", label: "Landscape (1024x768)" },
  { value: "768x1024", label: "Portrait (768x1024)" },
];

// Updated to show mock models instead of DALL-E models
export const modelOptions = [
  { value: "free-model-basic", label: "Basic Model" },
  { value: "free-model-advanced", label: "Advanced Model (Premium)" },
];