// app/api/database/sync/route.ts
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { type, ...data } = body;

        // Get user from database
        const user = await db.query.users.findFirst({
            where: eq(schema.users.clerkId, userId)
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Save generation based on type
        let result;

        switch (type) {
            case 'image':
                result = await db.insert(schema.imageGenerations).values({
                    userId: user.id,
                    prompt: data.prompt,
                    imageUrl: data.imageUrl,
                    model: data.model,
                    resolution: data.resolution,
                    metadata: data.metadata || {}
                }).returning();
                break;

            case 'video':
                result = await db.insert(schema.videoGenerations).values({
                    userId: user.id,
                    prompt: data.prompt,
                    videoUrl: data.videoUrl,
                    duration: data.duration,
                    metadata: data.metadata || {}
                }).returning();
                break;

            case 'audio':
                result = await db.insert(schema.audioGenerations).values({
                    userId: user.id,
                    prompt: data.prompt,
                    audioUrl: data.audioUrl,
                    duration: data.duration,
                    metadata: data.metadata || {}
                }).returning();
                break;

            case 'code':
                result = await db.insert(schema.codeGenerations).values({
                    userId: user.id,
                    prompt: data.prompt,
                    generatedCode: data.generatedCode,
                    language: data.language,
                    metadata: data.metadata || {}
                }).returning();
                break;

            case 'conversation':
                result = await db.insert(schema.conversations).values({
                    userId: user.id,
                    messages: data.messages,
                    model: data.model,
                    sessionId: data.sessionId,
                    metadata: data.metadata || {}
                }).returning();
                break;

            default:
                return new NextResponse("Invalid generation type", { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        console.error("[DATABASE_SYNC_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}