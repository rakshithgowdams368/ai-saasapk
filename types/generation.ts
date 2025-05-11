// types/generation.ts

// Base generation interface
export interface BaseGeneration {
    id: string;
    userId: string;
    prompt: string;
    createdAt: Date;
    synced: boolean;
  }
  
  // Image generation types
  export interface ImageGenerationOptions {
    model: 'chatgpt' | 'gemini';
    resolution: '256x256' | '512x512' | '1024x1024';
    amount: '1' | '2' | '3' | '4';
    enhancePrompt?: boolean;
  }
  
  export interface ImageGenerationResult extends BaseGeneration {
    type: 'image';
    model: 'chatgpt' | 'gemini';
    imageUrl: string;
    resolution: string;
    enhancedPrompt?: string;
    promptSuggestions?: string[];
    metadata: ImageGenerationOptions;
  }
  
  // Video generation types
  export interface VideoGenerationOptions {
    duration?: number;
    style?: string;
    quality?: 'standard' | 'high';
  }
  
  export interface VideoGenerationResult extends BaseGeneration {
    type: 'video';
    videoUrl: string;
    duration?: number;
    metadata: VideoGenerationOptions;
  }
  
  // Audio generation types
  export interface AudioGenerationOptions {
    duration?: number;
    style?: string;
    format?: 'mp3' | 'wav';
  }
  
  export interface AudioGenerationResult extends BaseGeneration {
    type: 'audio';
    audioUrl: string;
    duration?: number;
    metadata: AudioGenerationOptions;
  }
  
  // Code generation types
  export interface CodeGenerationOptions {
    language?: string;
    framework?: string;
    style?: 'concise' | 'detailed' | 'commented';
  }
  
  export interface CodeGenerationResult extends BaseGeneration {
    type: 'code';
    generatedCode: string;
    language?: string;
    metadata: CodeGenerationOptions;
  }
  
  // Conversation types
  export interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }
  
  export interface ConversationOptions {
    model?: 'gpt-3.5-turbo' | 'gpt-4';
    temperature?: number;
    maxTokens?: number;
  }
  
  export interface ConversationResult extends BaseGeneration {
    type: 'conversation';
    messages: ConversationMessage[];
    sessionId: string;
    metadata: ConversationOptions;
  }
  
  // Union type for all generations
  export type GenerationResult = 
    | ImageGenerationResult
    | VideoGenerationResult
    | AudioGenerationResult
    | CodeGenerationResult
    | ConversationResult;
  
  // API Response types
  export interface GenerationResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  // Local storage types for IndexedDB
  export interface LocalGeneration {
    id: string;
    userId: string;
    type: 'image' | 'video' | 'audio' | 'code' | 'conversation';
    prompt: string;
    result: string | Blob;
    model?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    synced: boolean;
  }
  
  // Form validation types
  export interface GenerationFormData {
    prompt: string;
    model?: string;
    options?: Record<string, any>;
  }
  
  // Error types
  export interface GenerationError {
    code: string;
    message: string;
    details?: any;
  }