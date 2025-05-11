// File path: app/api/gemini/image/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // Get auth asynchronously - the correct way to fix the headers warning
    const session = await auth();
    const userId = session.userId;
         
    // Parse request body
    const body = await req.json();
    const {
      prompt,
      amount = 1,
      style = 'photorealistic'
    } = body;
     
    // Check authorization
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
     
    // Validate prompt
    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }
    
    // For testing purposes, generate placeholder images using a different service
    // Using picsum.photos which is reliable and doesn't require DNS resolution of specialized domains
    const images = [];
    
    for (let i = 0; i < amount; i++) {
      // Using picsum.photos with a seed to get consistent images based on prompt
      const seed = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + i;
      images.push({
        url: `https://picsum.photos/seed/${seed}/512/512`,
        prompt: prompt
      });
    }
     
    return NextResponse.json(images);
   } catch (error) {
    console.error("Image generation error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}