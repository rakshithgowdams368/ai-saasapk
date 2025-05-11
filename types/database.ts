// types/database.ts

// User related types
export interface User {
    id: string;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Subscription types
  export interface Subscription {
    id: string;
    userId: string;
    plan: 'free' | 'basic' | 'pro';
    status: 'active' | 'cancelled' | 'expired';
    amount: number;
    currency: string;
    startDate: Date;
    endDate?: Date;
    paypalSubscriptionId?: string;
    paypalPayerId?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Billing/Invoice types
  export interface Invoice {
    id: string;
    userId: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    paypalPaymentId?: string;
    paypalInvoiceId?: string;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    paidAt?: Date;
    invoiceJson: any; // Store full invoice data
    pdfUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Generation history types
  export interface ImageGeneration {
    id: string;
    userId: string;
    prompt: string;
    model: 'chatgpt' | 'gemini';
    imageUrl: string;
    resolution: string;
    metadata?: {
      enhancedPrompt?: string;
      promptSuggestions?: string[];
      settings?: any;
    };
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface VideoGeneration {
    id: string;
    userId: string;
    prompt: string;
    videoUrl: string;
    duration?: number;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface AudioGeneration {
    id: string;
    userId: string;
    prompt: string;
    audioUrl: string;
    duration?: number;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CodeGeneration {
    id: string;
    userId: string;
    prompt: string;
    generatedCode: string;
    language?: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ConversationMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }
  
  export interface Conversation {
    id: string;
    userId: string;
    messages: ConversationMessage[];
    model: string;
    sessionId: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Settings types
  export interface UserSettings {
    id: string;
    userId: string;
    general: {
      language: string;
      timezone: string;
      animations: boolean;
    };
    appearance: {
      theme: 'light' | 'dark' | 'system';
      accentColor: string;
      fontSize: 'small' | 'medium' | 'large';
      reducedMotion: boolean;
      highContrast: boolean;
    };
    notifications: {
      emailGenerationComplete: boolean;
      emailSystemUpdates: boolean;
      browserNotifications: boolean;
    };
    ai: {
      defaultModel: string;
      qualityPreference: 'speed' | 'balanced' | 'quality';
      defaultImageSettings: {
        resolution: string;
        style: string;
      };
    };
    privacy: {
      dataCollection: boolean;
      saveHistory: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Help/Contact form types
  export interface ContactMessage {
    id: string;
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    status: 'new' | 'in_progress' | 'resolved';
    createdAt: Date;
    updatedAt: Date;
  }