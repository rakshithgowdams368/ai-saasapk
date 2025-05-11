//file path :-ai-saas-antonio-main/app/(dashboard)/(routes)/conversation/constants.ts
// app/(dashboard)/(routes)/conversation/constants.ts
import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required",
  }),
});