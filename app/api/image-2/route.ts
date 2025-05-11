// File path: app/api/image-2/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Replicate from "replicate";
import * as fs from 'fs/promises';
import path from 'path';
import { db, saveGeneration } from "@/lib/db";

// Initialize Replicate client with API token
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
});

// Image prompt enhancer function
function enhanceImagePrompt(userPrompt: string, model: string): string {
    // Check if the prompt already contains detailed instructions
    if (userPrompt.length > 100) {
        return userPrompt; // The user already provided a detailed prompt
    }

    // Basic subject from the prompt
    let subject = userPrompt;

    // Default style additions based on the selected model
    let styleAdditions = '';
    let qualityAdditions = 'high quality, detailed';

    if (model === 'free-model-advanced') {
        // More advanced style enhancements for the premium model
        styleAdditions = 'professional photography, masterful composition, perfect lighting';
        qualityAdditions = 'ultra high definition, extremely detailed, 8k resolution, masterpiece';
    }

    // Build enhanced prompt
    let enhancedPrompt = `${subject}, ${styleAdditions}, ${qualityAdditions}`;

    return enhancedPrompt.trim();
}

// Function to save image data to a JSON file
async function saveImageDataToFile(
    imageUrls: string[],
    prediction: any,
    prompt: string,
    enhancedPrompt: string,
    model: string,
    resolution: string
) {
    try {
        // Create a unique filename based on timestamp and prediction ID
        const timestamp = new Date().getTime();
        const imageId = prediction.id || 'unknown';
        const filename = `image_${imageId}_${timestamp}.json`;

        // Define the directory path for storing JSON files
        const dirPath = path.join(process.cwd(), 'public', 'images', 'data');

        // Create the directory if it doesn't exist
        await fs.mkdir(dirPath, { recursive: true });

        // Create the full file path
        const filePath = path.join(dirPath, filename);

        // Prepare data for saving
        const dataToSave = {
            id: imageId,
            status: prediction.status,
            createdAt: prediction.created_at,
            completedAt: prediction.completed_at,
            originalPrompt: prompt,
            enhancedPrompt: enhancedPrompt,
            imageUrls: imageUrls,
            model: model,
            resolution: resolution,
            modelVersion: prediction.version,
            input: prediction.input,
            metrics: prediction.metrics,
            savedAt: new Date().toISOString(),
            urls: prediction.urls || null // Save the Replicate URLs
        };

        // Write the JSON data to the file
        await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');

        console.log(`Image data saved to: ${filePath}`);

        // Return file information
        return {
            success: true,
            filename: filename,
            filepath: `/images/data/${filename}`, // Relative path for client access
            absolutePath: filePath // Full server path (not exposed to client)
        };
    } catch (error) {
        console.error("Error saving image data to file:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

// Helper function to create a prediction without version ID
async function createPrediction(prompt: string, aspectRatio: string, numOutputs = 1) {
    try {
        console.log("Creating prediction with minimax/image-01");
        console.log("Inputs:", { prompt, aspect_ratio: aspectRatio, num_outputs: numOutputs });
        
        // Use model name directly instead of version ID
        const prediction = await replicate.predictions.create({
            model: "minimax/image-01",
            input: {
                prompt: prompt,
                aspect_ratio: aspectRatio,
                num_outputs: numOutputs
            },
        });
        
        console.log("Prediction created:", prediction.id);
        return prediction;
    } catch (error) {
        console.error("Error creating prediction:", error);
        throw error;
    }
}

// Helper function to wait for a prediction to complete
async function waitForPrediction(predictionId: string) {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (60 × 5s = 300s = 5min)
    
    console.log("Waiting for prediction to complete:", predictionId);
    
    while (attempts < maxAttempts) {
        const prediction = await replicate.predictions.get(predictionId);
        console.log(`Attempt ${attempts + 1}: Status = ${prediction.status}`);
        
        if (prediction.status === "succeeded") {
            console.log("Prediction succeeded!");
            // Log the complete prediction object for debugging
            console.log("Complete prediction:", JSON.stringify(prediction));
            return prediction;
        }
        
        if (prediction.status === "failed" || prediction.status === "canceled") {
            console.error("Prediction failed or canceled:", prediction.error);
            throw new Error(`Prediction ${prediction.status}: ${prediction.error || "Unknown error"}`);
        }
        
        // Wait 5 seconds between attempts
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
    }
    
    throw new Error("Prediction timed out after 5 minutes");
}

// POST endpoint for image generation
export async function POST(req: Request) {
    try {
        // Use await with auth() to resolve the headers iteration error
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            return new NextResponse("Replicate API token not configured", { status: 500 });
        }

        console.log("Processing request for user:", userId);

        // Parse request body
        const body = await req.json();
        const { prompt, amount = "1", resolution = "1024x1024", model = "free-model-basic" } = body;

        if (!prompt) {
            return new NextResponse("Prompt is required", { status: 400 });
        }

        console.log("Request parameters:", { prompt, amount, resolution, model });

        let prediction;
        let completedPrediction;
        let enhancedPrompt = "";

        // Determine aspect ratio based on resolution
        let aspectRatio = "1:1"; // Default square aspect ratio

        // Parse resolution to determine aspect ratio
        if (resolution === "1024x768") {
            aspectRatio = "4:3"; // Landscape
        } else if (resolution === "768x1024") {
            aspectRatio = "3:4"; // Portrait
        } else if (resolution === "1024x1024" || resolution === "512x512") {
            aspectRatio = "1:1"; // Square
        }

        // Enhance prompt based on model
        enhancedPrompt = enhanceImagePrompt(prompt, model);

        console.log("Original prompt:", prompt);
        console.log("Enhanced prompt for image:", enhancedPrompt);
        console.log("Aspect ratio:", aspectRatio);

        try {
            // Create the prediction using model name (no version needed)
            console.log("Creating prediction with:", {
                prompt: enhancedPrompt,
                aspect_ratio: aspectRatio,
                num_outputs: parseInt(amount)
            });
            
            // Create prediction
            prediction = await createPrediction(enhancedPrompt, aspectRatio, parseInt(amount));
            console.log("Prediction created:", prediction.id);
            
            // Wait for completion
            completedPrediction = await waitForPrediction(prediction.id);
            
            // Log the raw prediction response for debugging
            console.log("Raw prediction response:", JSON.stringify(completedPrediction));
            
            // Save image data to a local JSON file
            const saveResult = await saveImageDataToFile(
                completedPrediction.output,
                completedPrediction,
                prompt,
                enhancedPrompt,
                model,
                resolution
            );

            // Save to database - Skip if imageGenerations table doesn't exist yet
            try {
                console.log("Attempting to save images to database...");
                
                try {
                    // Save each image URL to the database
                    const savedImages = [];
                    for (const imageUrl of completedPrediction.output) {
                        const saved = await saveGeneration('image', {
                            userId: userId,
                            prompt: prompt,
                            imageUrl: imageUrl,
                            model: model,
                            resolution: resolution,
                            metadata: {
                                replicateId: completedPrediction.id,
                                enhancedPrompt: enhancedPrompt,
                                aspectRatio: aspectRatio,
                                streamUrl: completedPrediction.urls?.stream,
                                predictionUrl: completedPrediction.urls?.get,
                                type: "image-2"
                            }
                        });
                        
                        savedImages.push(saved);
                    }
                    console.log("Images saved to database:", savedImages);
                } catch (dbError) {
                    // Detect if this is a "relation does not exist" error
                    const errorMessage = String(dbError);
                    if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
                        console.log("Database table doesn't exist yet - skipping database save");
                    } else {
                        console.error("Error saving to database:", dbError);
                    }
                }
            } catch (outerDbError) {
                console.error("Outer database error:", outerDbError);
                // Continue execution even if database save fails
            }

            // Return the exact Replicate API response along with our additional info
            return NextResponse.json({
                // Include the complete Replicate response
                ...completedPrediction,
                
                // Add our additional fields
                success: true,
                usedPrompt: enhancedPrompt,
                model: model,
                resolution: resolution,
                jsonFile: saveResult.success ? {
                    path: saveResult.filepath,
                    filename: saveResult.filename
                } : null,
                message: "Images generated successfully!"
            });
            
        } catch (error) {
            console.error("Error generating images:", error);
            
            // For development/testing, use placeholder images when API calls fail
            if (process.env.NODE_ENV === 'development') {
                console.log("Using placeholder images for development");
                const placeholderUrls = [
                    "https://picsum.photos/seed/img1/1024/1024",
                    "https://picsum.photos/seed/img2/1024/1024"
                ].slice(0, parseInt(amount));
                
                // Create a mock prediction object
                const mockPrediction = {
                    id: "dev-" + Date.now(),
                    status: "succeeded",
                    created_at: new Date().toISOString(),
                    completed_at: new Date().toISOString(),
                    version: "minimax/image-01",
                    input: {
                        prompt: enhancedPrompt,
                        aspect_ratio: aspectRatio
                    },
                    output: placeholderUrls,
                    urls: {
                        stream: "https://stream.replicate.com/mock-stream",
                        get: "https://api.replicate.com/v1/predictions/mock",
                        cancel: "https://api.replicate.com/v1/predictions/mock/cancel"
                    }
                };
                
                // Save placeholder data
                const saveResult = await saveImageDataToFile(
                    placeholderUrls,
                    mockPrediction,
                    prompt,
                    enhancedPrompt,
                    model,
                    resolution
                );
                
                // Return the mock data
                return NextResponse.json({
                    ...mockPrediction,
                    success: true,
                    usedPrompt: enhancedPrompt,
                    model: model,
                    resolution: resolution,
                    jsonFile: saveResult.success ? {
                        path: saveResult.filepath,
                        filename: saveResult.filename
                    } : null,
                    message: "⚠️ Using placeholder images. API error: " + String(error)
                });
            } else {
                // In production, propagate the error
                throw error;
            }
        }
    } catch (error) {
        console.error("[IMAGE_API_ERROR]", error);

        // More detailed error response for debugging
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            } : String(error)
        }, { status: 500 });
    }
}

// Helper function to get prompt enhancement suggestions
export async function OPTIONS(req: Request) {
    return NextResponse.json({
        promptTips: {
            styleOptions: ["realistic", "artistic", "fantasy", "abstract", "cinematic", "anime"],
            subjectIdeas: ["landscape", "portrait", "still life", "architecture", "animals", "nature"],
            qualityModifiers: ["detailed", "high resolution", "professional", "masterpiece"],
            examples: {
                basic: "mountain landscape",
                enhanced: enhanceImagePrompt("mountain landscape", "free-model-basic")
            },
            modelTypes: ["free-model-basic", "free-model-advanced"]
        }
    });
}

// GET endpoint to retrieve saved image data
export async function GET(req: Request) {
    try {
        // Check authentication
        const { userId } = await auth();
        
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        console.log("Processing GET request for user:", userId);
        
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        
        // Directory path for stored JSON files
        const dirPath = path.join(process.cwd(), 'public', 'images', 'data');
        
        // Create directory if it doesn't exist
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (mkdirError) {
            console.error("Error creating directory:", mkdirError);
        }

        // If ID is provided, return specific image data
        if (id) {
            try {
                // Find files matching the ID pattern
                const files = await fs.readdir(dirPath);
                const matchingFile = files.find(file => file.includes(`_${id}_`));

                if (!matchingFile) {
                    return NextResponse.json({
                        success: false,
                        message: "Image data not found"
                    }, { status: 404 });
                }

                // Read and return the file content
                const filePath = path.join(dirPath, matchingFile);
                const fileContent = await fs.readFile(filePath, 'utf-8');
                const imageData = JSON.parse(fileContent);

                return NextResponse.json({
                    success: true,
                    imageData: imageData
                });
            } catch (error) {
                if (error instanceof Error && error.code === 'ENOENT') {
                    return NextResponse.json({
                        success: false,
                        message: "Image data directory not found",
                        error: "ENOENT"
                    }, { status: 404 });
                }
                
                return NextResponse.json({
                    success: false,
                    message: "Error retrieving image data",
                    error: error instanceof Error ? error.message : String(error)
                }, { status: 500 });
            }
        }

        // If no ID, return list of all saved image files
        try {
            const files = await fs.readdir(dirPath);
            
            // Sort files by creation time (newest first)
            const sortedFiles = files.sort((a, b) => {
                // Extract timestamps from filenames (assuming format image_*_TIMESTAMP.json)
                const timestampA = parseInt(a.split('_').pop()?.split('.')[0] || '0');
                const timestampB = parseInt(b.split('_').pop()?.split('.')[0] || '0');
                return timestampB - timestampA; // Descending order (newest first)
            });
            
            // Limit the number of files
            const limitedFiles = sortedFiles.slice(0, limit);

            // Get basic info for each saved image
            const imageInfo = await Promise.all(
                limitedFiles.map(async (file) => {
                    try {
                        const filePath = path.join(dirPath, file);
                        const content = await fs.readFile(filePath, 'utf-8');
                        const data = JSON.parse(content);

                        return {
                            id: data.id,
                            filename: file,
                            path: `/images/data/${file}`,
                            prompt: data.originalPrompt,
                            imageUrls: data.imageUrls,
                            model: data.model,
                            resolution: data.resolution,
                            createdAt: data.createdAt || data.savedAt,
                            streamUrl: data.urls?.stream,
                            predictionUrl: data.urls?.get
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
                count: imageInfo.length,
                totalCount: files.length,
                images: imageInfo
            });
        } catch (error) {
            if (error instanceof Error && error.code === 'ENOENT') {
                // Directory doesn't exist yet, return empty list
                return NextResponse.json({
                    success: true,
                    count: 0,
                    images: []
                });
            }

            // Other errors
            return NextResponse.json({
                success: false,
                message: "Error retrieving image list",
                error: error instanceof Error ? error.message : String(error)
            }, { status: 500 });
        }
    } catch (error) {
        console.error("[IMAGE_LIST_ERROR]", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}