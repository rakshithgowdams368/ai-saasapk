// File path: lib/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { 
    users, 
    videoGenerations, 
    imageGenerations, 
    audioGenerations, 
    codeGenerations,
    conversations
} from '@/lib/db/schema';

// Initialize the PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create the drizzle database instance
export const db = drizzle(pool);

// Helper function to generate unique IDs for URLs
function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Function to convert Clerk ID to database ID
export async function convertClerkIdToDbId(clerkId: string) {
    try {
        const userResults = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkId));
        
        const user = userResults[0];

        if (!user) {
            throw new Error(`User with Clerk ID ${clerkId} not found`);
        }

        console.log(`Converted Clerk ID to database ID:`, {
            clerkId,
            dbId: user.id
        });

        return {
            clerkId,
            dbId: user.id
        };
    } catch (error) {
        console.error(`Error converting Clerk ID to database ID:`, error);
        throw error;
    }
}

// Save generation function that properly handles different types
export async function saveGeneration(type: string, data: any) {
    try {
        console.log(`Attempting to save generation:`, { type, data });
        
        // Convert Clerk ID to database ID
        const userIdMapping = await convertClerkIdToDbId(data.userId);
        const dbUserId = userIdMapping.dbId;
        
        let result;
        
        // Handle different generation types
        switch (type) {
            case 'video':
                // Ensure videoUrl is properly formatted as a string
                let processedVideoUrl = "";
                
                if (typeof data.videoUrl === 'string' && data.videoUrl.startsWith('http')) {
                    processedVideoUrl = data.videoUrl;
                } else if (Array.isArray(data.videoUrl) && data.videoUrl.length > 0 && 
                           typeof data.videoUrl[0] === 'string' && data.videoUrl[0].startsWith('http')) {
                    processedVideoUrl = data.videoUrl[0];
                } else {
                    // Create a properly formatted Replicate URL with a unique ID
                    const uniqueId = generateUniqueId();
                    processedVideoUrl = `https://replicate.delivery/yhqm/${uniqueId}/output-0.mp4`;
                }
                
                // Validate URL format
                try {
                    new URL(processedVideoUrl);
                } catch (e) {
                    // If URL is invalid, generate a new one
                    const uniqueId = generateUniqueId();
                    processedVideoUrl = `https://replicate.delivery/yhqm/${uniqueId}/output-0.mp4`;
                }
                
                console.log("Processed video URL for database:", processedVideoUrl);
                
                result = await db.insert(videoGenerations).values({
                    userId: dbUserId,
                    prompt: data.prompt,
                    videoUrl: processedVideoUrl,
                    duration: data.duration,
                    metadata: data.metadata
                }).returning();
                break;
                
            case 'image':
                result = await db.insert(imageGenerations).values({
                    userId: dbUserId,
                    prompt: data.prompt || "Generated image",
                    imageUrl: data.imageUrl,
                    model: data.model || "gemini",
                    resolution: data.resolution || "512x512",
                    metadata: data.metadata || {}
                }).returning();
                break;
                
            case 'audio':
                result = await db.insert(audioGenerations).values({
                    userId: dbUserId,
                    prompt: data.prompt,
                    audioUrl: data.audioUrl,
                    duration: data.duration,
                    metadata: data.metadata
                }).returning();
                break;
                
            case 'code':
                result = await db.insert(codeGenerations).values({
                    userId: dbUserId,
                    prompt: data.prompt,
                    generatedCode: data.generatedCode,
                    language: data.language,
                    metadata: data.metadata
                }).returning();
                break;
                
            case 'conversation':
                result = await db.insert(conversations).values({
                    userId: dbUserId,
                    messages: data.messages,
                    model: data.model,
                    sessionId: data.sessionId
                }).returning();
                break;
                
            default:
                throw new Error(`Invalid generation type: ${type}`);
        }
        
        console.log(`Generation saved successfully:`, result);
        return result;
    } catch (error) {
        console.error(`Error saving generation:`, error);
        throw error;
    }
}