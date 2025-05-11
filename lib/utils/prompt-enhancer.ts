// lib/utils/prompt-enhancer.ts

/**
 * Enhances user prompts to generate better images with Gemini AI
 * This utility improves basic prompts by adding more details and structure
 */

export type StyleType = 
  | 'photorealistic' 
  | 'artistic' 
  | 'fantasy' 
  | 'abstract' 
  | 'vintage' 
  | 'minimalist' 
  | 'noir' 
  | 'cyberpunk' 
  | 'anime';

export interface EnhancementOptions {
  style: StyleType;
  enhancementLevel: 'minimal' | 'moderate' | 'maximum';
  preserveOriginal: boolean;
  resolution?: string;
  aspectRatio?: string;
}

export interface EnhancementResult {
  enhancedPrompt: string;
  originalPrompt: string;
  missingElements: string[];
  addedElements: string[];
}

const styleDescriptors: Record<StyleType, string[]> = {
  photorealistic: [
    'ultra detailed photograph', 
    'photorealistic', 
    'high resolution', 
    '8k', 
    'detailed lighting', 
    'professional photography',
    'hyperrealistic',
    'hdr'
  ],
  artistic: [
    'artistic style', 
    'vibrant colors', 
    'stylized', 
    'creative composition', 
    'digital art', 
    'illustration',
    'expressive brushwork',
    'artistic composition'
  ],
  fantasy: [
    'magical', 
    'fantasy scene', 
    'ethereal light', 
    'dreamlike quality', 
    'mystical atmosphere', 
    'surreal',
    'enchanted',
    'magical realism'
  ],
  abstract: [
    'abstract composition',
    'non-representational',
    'dynamic shapes',
    'bold colors',
    'geometric patterns',
    'asymmetrical balance',
    'modern art style',
    'expressive forms'
  ],
  vintage: [
    'vintage style',
    'retro aesthetic',
    'nostalgic colors',
    'film grain',
    'classic composition',
    'aged texture',
    'historical feel',
    'period-accurate details'
  ],
  minimalist: [
    'minimalist design',
    'clean lines',
    'simple elements',
    'negative space',
    'limited color palette',
    'understated',
    'elegant simplicity',
    'essential forms only'
  ],
  noir: [
    'film noir style',
    'dramatic shadows',
    'high contrast',
    'moody atmosphere',
    'black and white',
    'mysterious ambiance',
    'dramatic lighting',
    'cinematic composition'
  ],
  cyberpunk: [
    'futuristic cyberpunk',
    'neon lights',
    'urban technology',
    'dystopian elements',
    'high-tech low-life',
    'digital interface',
    'sci-fi cityscape',
    'cybernetic aesthetics'
  ],
  anime: [
    'anime style',
    'distinctive character design',
    'vibrant scene',
    'cel shading',
    'expressive features',
    'manga-inspired',
    'dynamic poses',
    'iconic anime aesthetic'
  ]
};

const qualityEnhancers = [
  'highly detailed',
  'sharp focus',
  'intricate',
  'professional quality',
  'masterful composition',
  'perfect balance',
  'expert craftsmanship',
  'stunning'
];

const lightingEnhancers = [
  'dramatic lighting',
  'soft illumination',
  'golden hour light',
  'volumetric lighting',
  'rim lighting',
  'ambient occlusion',
  'global illumination',
  'beautiful shadows'
];

const moodEnhancers = [
  'atmospheric',
  'evocative mood',
  'emotional tone',
  'expressive feeling',
  'captivating ambiance',
  'compelling atmosphere',
  'immersive environment',
  'distinctive mood'
];

/**
 * Detects if a prompt is missing key elements and adds suggestions
 */
function detectMissingElements(prompt: string): string[] {
  const missingElements: string[] = [];
  
  // Check for common missing elements
  if (!/(background|scene|setting|environment|landscape|location)/i.test(prompt)) {
    missingElements.push('setting or background');
  }
  
  if (!/(lighting|light|illuminated|shadows|dark|bright|sunlight|moonlight)/i.test(prompt)) {
    missingElements.push('lighting conditions');
  }
  
  if (!/(angle|perspective|view|shot|close-up|distance|aerial)/i.test(prompt)) {
    missingElements.push('perspective or angle');
  }
  
  if (!/(mood|atmosphere|feeling|tone|ambiance)/i.test(prompt)) {
    missingElements.push('mood or atmosphere');
  }
  
  if (!/(colou?r|hue|saturation|vibrant|muted|monochrome|palette)/i.test(prompt)) {
    missingElements.push('color palette');
  }
  
  if (!/(detailed|intricate|texture|fine|resolution|quality)/i.test(prompt)) {
    missingElements.push('detail level');
  }
  
  return missingElements;
}

/**
 * Enhances a prompt based on the detected style and missing elements
 */
export function enhancePrompt(
  originalPrompt: string, 
  options: EnhancementOptions
): EnhancementResult {
  // Clean the prompt
  const cleanPrompt = originalPrompt.trim();
  if (!cleanPrompt) {
    return {
      enhancedPrompt: originalPrompt,
      originalPrompt,
      missingElements: [],
      addedElements: []
    };
  }
  
  // Get missing elements
  const missingElements = detectMissingElements(cleanPrompt);
  
  // Enhanced prompt components
  let enhancedComponents: string[] = [];
  const addedElements: string[] = [];
  
  // Add original prompt if preserving
  if (options.preserveOriginal) {
    enhancedComponents.push(cleanPrompt);
  }
  
  // Select style descriptors based on enhancement level
  const styleDescriptorList = styleDescriptors[options.style] || styleDescriptors.photorealistic;
  let selectedStyleDescriptors: string[] = [];
  
  if (options.enhancementLevel === 'minimal') {
    // Select just 1-2 style descriptors
    selectedStyleDescriptors = styleDescriptorList.slice(0, 2);
  } else if (options.enhancementLevel === 'moderate') {
    // Select 3-4 style descriptors
    selectedStyleDescriptors = styleDescriptorList.slice(0, 4);
  } else {
    // Maximum enhancement - use 5-6 descriptors
    selectedStyleDescriptors = styleDescriptorList.slice(0, 6);
  }
  
  // Add the style descriptors
  if (selectedStyleDescriptors.length > 0) {
    enhancedComponents.push(selectedStyleDescriptors.join(', '));
    addedElements.push('style descriptors');
  }
  
  // Add quality enhancers based on enhancement level
  let selectedQualityEnhancers: string[] = [];
  if (options.enhancementLevel === 'maximum') {
    selectedQualityEnhancers = qualityEnhancers.slice(0, 3);
    enhancedComponents.push(selectedQualityEnhancers.join(', '));
    addedElements.push('quality enhancers');
  } else if (options.enhancementLevel === 'moderate') {
    selectedQualityEnhancers = qualityEnhancers.slice(0, 1);
    enhancedComponents.push(selectedQualityEnhancers.join(', '));
    addedElements.push('quality enhancer');
  }
  
  // Add lighting enhancers if missing
  if (missingElements.includes('lighting conditions')) {
    const lightingIndex = options.enhancementLevel === 'minimal' ? 0 : 
                         options.enhancementLevel === 'moderate' ? 1 : 2;
    enhancedComponents.push(lightingEnhancers[lightingIndex]);
    addedElements.push('lighting');
  }
  
  // Add mood enhancers if missing
  if (missingElements.includes('mood or atmosphere')) {
    const moodIndex = options.enhancementLevel === 'minimal' ? 0 : 
                     options.enhancementLevel === 'moderate' ? 1 : 2;
    enhancedComponents.push(moodEnhancers[moodIndex]);
    addedElements.push('mood');
  }
  
  // Add resolution if provided
  if (options.resolution) {
    enhancedComponents.push(`${options.resolution} resolution`);
    addedElements.push('resolution');
  }
  
  // Add aspect ratio if provided
  if (options.aspectRatio) {
    enhancedComponents.push(`${options.aspectRatio} aspect ratio`);
    addedElements.push('aspect ratio');
  }
  
  // Combine all components
  const enhancedPrompt = enhancedComponents.join(', ');
  
  return {
    enhancedPrompt,
    originalPrompt,
    missingElements,
    addedElements
  };
}

/**
 * Maps enhancement strength (0.0-1.0) to enhancement level
 */
export function getEnhancementLevel(strength: number): 'minimal' | 'moderate' | 'maximum' {
  if (strength < 0.3) {
    return 'minimal';
  } else if (strength < 0.7) {
    return 'moderate';
  } else {
    return 'maximum';
  }
}

/**
 * Extended enhancement function with more advanced controls
 */
export function generateEnhancedPrompt(
  userPrompt: string,
  style: StyleType,
  enhancementStrength: number = 0.5, // 0.0 to 1.0
  resolution?: string,
  aspectRatio?: string
): EnhancementResult {
  // Map enhancement strength to enhancement level
  const enhancementLevel = getEnhancementLevel(enhancementStrength);
  
  return enhancePrompt(userPrompt, {
    style,
    enhancementLevel,
    preserveOriginal: true,
    resolution,
    aspectRatio
  });
}