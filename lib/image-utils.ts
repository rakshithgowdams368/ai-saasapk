// app/lib/image-utils.ts

// Categorize prompt based on keywords
export const categorizePrompt = (prompt: string): string => {
    const promptLower = prompt.toLowerCase();
    
    const categories: Record<string, string[]> = {
      city: ["city", "urban", "building", "skyscraper", "street", "downtown", "architecture"],
      nature: ["nature", "landscape", "mountain", "forest", "tree", "river", "lake", "ocean", "sky", "sunset", "beach"],
      people: ["person", "portrait", "face", "man", "woman", "people", "crowd", "human", "character"],
      animals: ["animal", "dog", "cat", "bird", "wildlife", "pet", "creature", "horse", "lion", "tiger"],
      abstract: ["abstract", "pattern", "geometric", "vibrant", "colorful", "minimal", "texture", "generative"],
      food: ["food", "meal", "restaurant", "dish", "cuisine", "cooking", "kitchen", "dessert", "fruit"],
      technology: ["tech", "computer", "digital", "cyberpunk", "futuristic", "robot", "mechanical", "science", "phone"],
      fantasy: ["fantasy", "magic", "dragon", "mythical", "fairy", "epic", "medieval", "magical", "wizard", "castle"],
      space: ["space", "galaxy", "stars", "planet", "cosmic", "universe", "astronaut", "nebula", "interstellar"],
      historical: ["historical", "vintage", "retro", "ancient", "old", "history", "classic", "antique"]
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => promptLower.includes(keyword))) {
        return category;
      }
    }
    
    // Default to nature if no match found
    return "nature";
  };
  
  // Generate a deterministic seed from text
  export const getSeed = (text: string, index: number = 0): number => {
    let hash = 0;
    const normalizedText = text.toLowerCase().trim();
    
    for (let i = 0; i < normalizedText.length; i++) {
      hash = ((hash << 5) - hash) + normalizedText.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash + index * 1000);
  };
  
  // Generate image URL based on category and parameters
  export const generateImageUrl = (
    prompt: string, 
    index: number, 
    width: number, 
    height: number,
    model: string = "free-model-basic"
  ): string => {
    const category = categorizePrompt(prompt);
    const seed = getSeed(prompt, index);
    
    // Apply filters based on model type
    const isAdvancedModel = model.includes("advanced");
    const imageId = (seed % 1000) + 1;
    
    // Generate different URLs based on category
    switch (category) {
      case "city":
        return `https://picsum.photos/id/${100 + (imageId % 100)}/${width}/${height}?blur=${isAdvancedModel ? 0 : 1}`;
      case "people":
        return `https://picsum.photos/id/${200 + (imageId % 100)}/${width}/${height}`;
      case "animals":
        if (prompt.toLowerCase().includes("cat") || prompt.toLowerCase().includes("kitten")) {
          return `https://placekitten.com/${width}/${height}?image=${(seed % 16) + 1}`;
        }
        return `https://picsum.photos/id/${300 + (imageId % 100)}/${width}/${height}`;
      case "abstract":
        // Advanced model has more vibrant colors for abstract
        if (isAdvancedModel) {
          return `https://picsum.photos/id/${400 + (imageId % 100)}/${width}/${height}?grayscale=0`;
        }
        return `https://picsum.photos/id/${400 + (imageId % 100)}/${width}/${height}?grayscale=1`;
      case "food":
        return `https://picsum.photos/id/${500 + (imageId % 100)}/${width}/${height}`;
      case "technology":
        return `https://picsum.photos/id/${600 + (imageId % 100)}/${width}/${height}`;
      case "fantasy":
        return `https://picsum.photos/id/${700 + (imageId % 100)}/${width}/${height}`;
      case "space":
        return `https://picsum.photos/id/${800 + (imageId % 100)}/${width}/${height}`;
      case "historical":
        // Advanced model gives more detailed historical images
        if (isAdvancedModel) {
          return `https://picsum.photos/id/${900 + (imageId % 100)}/${width}/${height}`;
        }
        return `https://picsum.photos/id/${900 + (imageId % 100)}/${width}/${height}?grayscale=1`;
      case "nature":
      default:
        return `https://picsum.photos/seed/${seed}/${width}/${height}`;
    }
  };
  
  // Improve prompt with additional details (for advanced model)
  export const enhancePrompt = (prompt: string, model: string): string => {
    if (!model.includes("advanced")) {
      return prompt;
    }
    
    const category = categorizePrompt(prompt);
    const enhancements: Record<string, string> = {
      city: " with detailed architecture and atmospheric lighting",
      nature: " with dramatic lighting and vivid colors",
      people: " with professional studio lighting and detailed features",
      animals: " in their natural habitat with perfect lighting",
      abstract: " with complex patterns and vibrant color palette",
      food: " with professional food photography lighting and composition",
      technology: " with futuristic glow and detailed mechanical elements",
      fantasy: " with magical atmosphere and epic lighting",
      space: " with cosmic nebula clouds and stars in high detail",
      historical: " with period-accurate details and atmospheric lighting"
    };
    
    return prompt + (enhancements[category] || "");
  };