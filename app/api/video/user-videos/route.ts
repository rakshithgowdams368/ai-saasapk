// File path: app/api/video/user-videos/route.ts
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videoGenerations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { convertClerkIdToDbId } from "@/lib/db";

export async function GET() {
  try {
    // Authenticate the user
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    try {
      // Convert Clerk ID to database ID
      const userMapping = await convertClerkIdToDbId(userId);
      const dbUserId = userMapping.dbId;
      
      // Fetch videos belonging to this user
      const videos = await db
        .select()
        .from(videoGenerations)
        .where(eq(videoGenerations.userId, dbUserId))
        .orderBy(videoGenerations.createdAt, 'desc');
      
      return NextResponse.json(videos);
    } catch (dbError) {
      console.error("Database error:", dbError);
      
      // Return empty array instead of error
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching user videos:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}