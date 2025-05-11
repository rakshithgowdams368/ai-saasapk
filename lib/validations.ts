// lib/validations.ts
import * as z from "zod";

// Auth validations
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Contact form validation
export const contactFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  captchaAnswer: z.string().min(1, "Please answer the captcha"),
});

// Generation validations
export const imageGenerationSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters"),
  model: z.enum(["chatgpt", "gemini"]),
  resolution: z.enum(["256x256", "512x512", "1024x1024"]),
  amount: z.enum(["1", "2", "3", "4"]),
});

export const videoGenerationSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters"),
});

export const audioGenerationSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters"),
});

export const codeGenerationSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters"),
});

export const conversationSchema = z.object({
  prompt: z.string().min(1, "Message cannot be empty"),
});

// Settings validations
export const generalSettingsSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  animations: z.boolean(),
});

export const appearanceSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  accentColor: z.string(),
  fontSize: z.enum(["small", "medium", "large"]),
  reducedMotion: z.boolean(),
  highContrast: z.boolean(),
});

export const notificationSettingsSchema = z.object({
  emailGenerationComplete: z.boolean(),
  emailSystemUpdates: z.boolean(),
  browserNotifications: z.boolean(),
});

export const aiSettingsSchema = z.object({
  defaultModel: z.string(),
  qualityPreference: z.enum(["speed", "balanced", "quality"]),
  defaultImageSettings: z.object({
    resolution: z.string(),
    style: z.string(),
  }),
});

export const privacySettingsSchema = z.object({
  dataCollection: z.boolean(),
  saveHistory: z.boolean(),
});

// Payment validations
export const paymentSchema = z.object({
  plan: z.enum(["basic", "pro"]),
  orderId: z.string().optional(),
});

// API response validation
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Invoice validation
export const invoiceSchema = z.object({
  invoiceNumber: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  status: z.enum(["pending", "paid", "failed", "refunded"]),
  invoiceDate: z.date(),
  dueDate: z.date(),
});

// Subscription validation
export const subscriptionSchema = z.object({
  plan: z.enum(["free", "basic", "pro"]),
  status: z.enum(["active", "cancelled", "expired", "past_due"]),
  amount: z.number().min(0),
  currency: z.string().length(3),
  startDate: z.date(),
  endDate: z.date().optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type),
      "Only .jpg, .png, .gif, and .webp formats are supported"
    ),
});

// Environment variables validation
export const envSchema = z.object({
  // Auth
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  
  // AI APIs
  OPENAI_API_KEY: z.string(),
  GOOGLE_GEMINI_API_KEY: z.string(),
  REPLICATE_API_TOKEN: z.string(),
  
  // Database
  DATABASE_URL: z.string(),
  
  // PayPal
  PAYPAL_CLIENT_ID: z.string(),
  PAYPAL_CLIENT_SECRET: z.string(),
  PAYPAL_MODE: z.enum(["sandbox", "live"]),
  
  // SMTP
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  OWNER_EMAIL: z.string().email(),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ImageGenerationInput = z.infer<typeof imageGenerationSchema>;
export type VideoGenerationInput = z.infer<typeof videoGenerationSchema>;
export type AudioGenerationInput = z.infer<typeof audioGenerationSchema>;
export type CodeGenerationInput = z.infer<typeof codeGenerationSchema>;
export type ConversationInput = z.infer<typeof conversationSchema>;
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;
export type AppearanceSettingsInput = z.infer<typeof appearanceSettingsSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type AISettingsInput = z.infer<typeof aiSettingsSchema>;
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type APIResponse = z.infer<typeof apiResponseSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type EnvInput = z.infer<typeof envSchema>;