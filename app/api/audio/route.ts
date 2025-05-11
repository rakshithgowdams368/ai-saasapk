// File path: app/api/image-2/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Replicate from "replicate";
import * as fs from 'fs/promises';
import path from 'path';
import { db, saveGeneration } from "@/lib/db";

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
            savedAt: new Date().toISOString()
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

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { prompt, amount = "1", resolution = "1024x1024", model = "free-model-basic" } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            return new NextResponse("Replicate API token not configured", { status: 500 });
        }

        if (!prompt) {
            return new NextResponse("Prompt is required", { status: 400 });
        }

        let prediction;
        let imageUrls: string[] = [];
        let completedPrediction;
        let enhancedPrompt = "";

        // Determine which model to use based on the selection
        let modelVersion = "";
        let aspectRatio = "1:1"; // Default square aspect ratio

        // Parse resolution to determine aspect ratio
        if (resolution === "1024x768") {
            aspectRatio = "4:3"; // Landscape
        } else if (resolution === "768x1024") {
            aspectRatio = "3:4"; // Portrait
        } else if (resolution === "1024x1024" || resolution === "512x512") {
            aspectRatio = "1:1"; // Square
        }

        // Choose model version based on selected model
        if (model === "free-model-advanced") {
            // Premium model - using the latest version
            modelVersion = "minimax/image-01";
        } else {
            // Basic model - using the standard version
            modelVersion = "minimax/image-01";
        }

        // Enhance prompt based on model
        enhancedPrompt = enhanceImagePrompt(prompt, model);

        console.log("Original prompt:", prompt);
        console.log("Enhanced prompt for image:", enhancedPrompt);
        console.log("Using model:", modelVersion);
        console.log("Resolution:", resolution);
        console.log("Aspect ratio:", aspectRatio);

        // Create prediction for image generation
        prediction = await replicate.predictions.create({
            version: "ca9b687f632dae449f6bd453c6c8256e773a7e2d7df279dec4119964c3ce5133", // Use the actual version hash from minimax/image-01
            input: {
                prompt: enhancedPrompt,
                aspect_ratio: aspectRatio,
                num_outputs: parseInt(amount),
            },
        });

        console.log("Prediction created:", prediction.id);

        // Now wait for the prediction to complete
        completedPrediction = prediction;

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

        // Get the image URLs from the output
        // minimax/image-01 returns an array of image URLs
        if (Array.isArray(completedPrediction.output)) {
            imageUrls = completedPrediction.output;
        } else if (typeof completedPrediction.output === 'string') {
            // Handle single URL return
            imageUrls = [completedPrediction.output];
        } else {
            // Fallback for other output formats
            console.log("Unexpected output format:", completedPrediction.output);
            return NextResponse.json({
                success: false,
                message: "Unexpected output format from model",
                prediction: completedPrediction
            }, { status: 500 });
        }

        console.log("Image URLs:", imageUrls);

        // Save to database
        try {
            for (const url of imageUrls) {
                await saveGeneration('image', {
                    userId,
                    prompt: prompt,
                    imageUrl: url,
                    resolution: resolution,
                    metadata: {
                        model: model,
                        replicateId: completedPrediction.id,
                        enhancedPrompt: enhancedPrompt
                    }
                });
            }

            console.log("Images saved to database");
        } catch (dbError) {
            console.error("Error saving to database:", dbError);
            // Continue execution even if database save fails
        }

        // Save image data to a local JSON file
        const saveResult = await saveImageDataToFile(
            imageUrls,
            completedPrediction,
            prompt,
            enhancedPrompt,
            model,
            resolution
        );

        // Return successful response with image URLs
        return NextResponse.json({
            success: true,
            urls: imageUrls,
            prediction: completedPrediction,
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
        console.error("[IMAGE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
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
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        // Directory path for stored JSON files
        const dirPath = path.join(process.cwd(), 'public', 'images', 'data');

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

            // Get basic info for each saved image
            const imageInfo = await Promise.all(
                files.map(async (file) => {
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
                count: imageInfo.length,
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