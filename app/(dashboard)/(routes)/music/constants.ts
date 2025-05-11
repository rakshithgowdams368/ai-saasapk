//file path :-ai-saas-antonio-main/app/(dashboard)/(routes)/music/constants.ts
// app/(dashboard)/(routes)/music/constants.ts
import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Music prompt is required",
  }),
});