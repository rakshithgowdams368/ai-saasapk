// File path: app/api/video/route.ts
import { NextResponse } from "next/server";
import Replicate from "replicate";
import * as fs from 'fs/promises';
import path from 'path';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Video prompt enhancer function
function enhanceVideoPrompt(userPrompt: string): string {
  // Check if the prompt already contains detailed instructions
  if (userPrompt.length > 60) {
    return userPrompt; // The user already provided a detailed prompt
  }
  
  // Detect key subjects in the prompt
  let subject = userPrompt;
  
  // Detect style keywords
  let style = "";
  if (userPrompt.toLowerCase().includes("anime")) style = "anime style";
  else if (userPrompt.toLowerCase().includes("cartoon")) style = "cartoon style";
  else if (userPrompt.toLowerCase().includes("realistic")) style = "photorealistic";
  else if (userPrompt.toLowerCase().includes("cinematic")) style = "cinematic";
  else style = "cinematic"; // Default to cinematic if no style specified
  
  // Detect setting keywords
  let setting = "";
  if (userPrompt.toLowerCase().includes("space")) setting = "in outer space";
  else if (userPrompt.toLowerCase().includes("forest")) setting = "in a lush forest";
  else if (userPrompt.toLowerCase().includes("city")) setting = "in a bustling city";
  else if (userPrompt.toLowerCase().includes("beach")) setting = "on a beautiful beach";
  
  // Detect time of day
  let timeOfDay = "";
  if (userPrompt.toLowerCase().includes("night")) timeOfDay = "at night";
  else if (userPrompt.toLowerCase().includes("sunset")) timeOfDay = "during sunset";
  else if (userPrompt.toLowerCase().includes("morning")) timeOfDay = "in the morning";
  
  // Detect motion keywords
  let motion = "";
  if (userPrompt.toLowerCase().includes("running")) motion = "running";
  else if (userPrompt.toLowerCase().includes("flying")) motion = "flying";
  else if (userPrompt.toLowerCase().includes("swimming")) motion = "swimming";
  else if (userPrompt.toLowerCase().includes("dancing")) motion = "dancing";
  
  // Build enhanced prompt
  let enhancedPrompt = `${style}, ${subject}`;
  
  if (setting) enhancedPrompt += `, ${setting}`;
  if (timeOfDay) enhancedPrompt += `, ${timeOfDay}`;
  if (motion) enhancedPrompt += `, ${motion}`;
  
  // Add quality details
  enhancedPrompt += `, high quality, detailed, smooth motion, professional lighting, 4K resolution`;
  
  return enhancedPrompt;
}

// Function to save video data to a JSON file
async function saveVideoDataToFile(
  videoUrl: string, 
  prediction: any, 
  prompt: string, 
  enhancedPrompt: string
) {
  try {
    // Create a unique filename based on timestamp and prediction ID
    const timestamp = new Date().getTime();
    const videoId = prediction.id || 'unknown';
    const filename = `video_${videoId}_${timestamp}.json`;
    
    // Define the directory path for storing JSON files
    const dirPath = path.join(process.cwd(), 'public', 'videos', 'data');
    
    // Create the directory if it doesn't exist
    await fs.mkdir(dirPath, { recursive: true });
    
    // Create the full file path
    const filePath = path.join(dirPath, filename);
    
    // Prepare data for saving
    const dataToSave = {
      id: videoId,
      status: prediction.status,
      createdAt: prediction.created_at,
      completedAt: prediction.completed_at,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
      videoUrl: videoUrl,
      input: prediction.input,
      metrics: prediction.metrics,
      model: prediction.model,
      savedAt: new Date().toISOString()
    };
    
    // Write the JSON data to the file
    await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    
    console.log(`Video data saved to: ${filePath}`);
    
    // Return file information
    return {
      success: true,
      filename: filename,
      filepath: `/videos/data/${filename}`, // Relative path for client access
      absolutePath: filePath // Full server path (not exposed to client)
    };
  } catch (error) {
    console.error("Error saving video data to file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { prompt } = body;
    
    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }
    
    // Enhance the video prompt
    const enhancedPrompt = enhanceVideoPrompt(prompt);
    
    console.log("Original prompt:", prompt);
    console.log("Enhanced prompt for video:", enhancedPrompt);
    
    // First, create the prediction to get the ID and metadata
    const prediction = await replicate.predictions.create({
      version: "3a7e6cdc3f95192092fa47346a73c28d1373d1499f3b62cdea25efe355823afb",
      input: {
        prompt: enhancedPrompt,
      },
    });
    
    console.log("Prediction created:", prediction.id);
    
    // Now wait for the prediction to complete
    let completedPrediction = prediction;
    
    // Poll for the result if the prediction is not instantly completed
    if (prediction.status !== "succeeded") {
      console.log("Waiting for prediction to complete...");
      
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes (60 × 5s = 300s = 5min)
      
      while (attempts < maxAttempts && completedPrediction.status !== "succeeded") {
        // Wait 5 seconds between attempts
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Get the updated prediction
        completedPrediction = await replicate.predictions.get(prediction.id);
        console.log(`Attempt ${attempts + 1}: Status = ${completedPrediction.status}`);
        
        attempts++;
        
        // Exit early if the prediction failed or was canceled
        if (completedPrediction.status === "failed" || completedPrediction.status === "canceled") {
          break;
        }
      }
    }
    
    // Check if the prediction completed successfully
    if (completedPrediction.status !== "succeeded") {
      return NextResponse.json({
        success: false,
        message: `Prediction ${completedPrediction.status}: ${completedPrediction.error || "Unknown error"}`,
        prediction: completedPrediction
      }, { status: 500 });
    }
    
    // Get the video URL from the output
    const videoUrl = completedPrediction.output;
    
    console.log("Video URL:", videoUrl);
    
    // Save video data to a local JSON file
    const saveResult = await saveVideoDataToFile(
      videoUrl, 
      completedPrediction, 
      prompt, 
      enhancedPrompt
    );
    
    // Return detailed response
    return NextResponse.json({
      success: true,
      videoUrl: videoUrl,
      prediction: completedPrediction,
      usedPrompt: enhancedPrompt,
      jsonFile: saveResult.success ? {
        path: saveResult.filepath,
        filename: saveResult.filename
      } : null,
      message: "Video generated successfully!"
    });
  } catch (error) {
    console.log("[VIDEO_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Helper function to get prompt enhancement suggestions
export async function OPTIONS(req: Request) {
  return NextResponse.json({
    promptTips: {
      styleOptions: ["anime", "cartoon", "realistic", "cinematic"],
      settingOptions: ["space", "forest", "city", "beach"],
      timeOptions: ["night", "sunset", "morning"],
      motionOptions: ["running", "flying", "swimming", "dancing"],
      examples: {
        basic: "cat playing with yarn",
        enhanced: enhanceVideoPrompt("cat playing with yarn")
      }
    }
  });
}

// GET endpoint to retrieve saved video data
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    // Directory path for stored JSON files
    const dirPath = path.join(process.cwd(), 'public', 'videos', 'data');
    
    // If ID is provided, return specific video data
    if (id) {
      try {
        // Find files matching the ID pattern
        const files = await fs.readdir(dirPath);
        const matchingFile = files.find(file => file.includes(`_${id}_`));
        
        if (!matchingFile) {
          return NextResponse.json({ 
            success: false, 
            message: "Video data not found" 
          }, { status: 404 });
        }
        
        // Read and return the file content
        const filePath = path.join(dirPath, matchingFile);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const videoData = JSON.parse(fileContent);
        
        return NextResponse.json({
          success: true,
          videoData: videoData
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: "Error retrieving video data",
          error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
      }
    }
    
    // If no ID, return list of all saved videos
    try {
      const files = await fs.readdir(dirPath);
      
      // Get basic info for each saved video
      const videosInfo = await Promise.all(
        files.map(async (file) => {
          try {
            const filePath = path.join(dirPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            
            return {
              id: data.id,
              filename: file,
              path: `/videos/data/${file}`,
              prompt: data.originalPrompt,
              videoUrl: data.videoUrl,
              createdAt: data.createdAt || data.savedAt
            };
          } catch (error) {
            return {
              filename: file,
              error: "Could not parse file"
            };
          }
        })
      );
      
      return NextResponse.json({
        success: true,
        count: videosInfo.length,
        videos: videosInfo
      });
    } catch (error) {
      if (error instanceof Error && error.code === 'ENOENT') {
        // Directory doesn't exist yet, return empty list
        return NextResponse.json({
          success: true,
          count: 0,
          videos: []
        });
      }
      
      // Other errors
      return NextResponse.json({
        success: false,
        message: "Error retrieving video list",
        error: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[VIDEO_LIST_ERROR]", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}