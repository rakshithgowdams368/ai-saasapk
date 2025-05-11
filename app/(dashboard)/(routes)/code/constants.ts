//file path :-ai-saas-antonio-main/app/(dashboard)/(routes)/code/constants.ts
// app/(dashboard)/(routes)/code/constants.ts
import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Code prompt is required",
  }),
});