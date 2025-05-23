// app/(dashboard)/(routes)/video/constants.ts
import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Video prompt is required",
  }),
});