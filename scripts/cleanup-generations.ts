// scripts/cleanup-generations.ts
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { lt } from 'drizzle-orm';
import { imageGenerations } from '@/lib/db/schema';

const RETENTION_DAYS = 30; // Keep images for 30 days

async function cleanupOldGenerations() {
    try {
        // Find generations older than retention period
        const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

        // Find and delete old database records
        const oldGenerations = await db
            .select({
                userId: imageGenerations.userId,
                imageUrl: imageGenerations.imageUrl
            })
            .from(imageGenerations)
            .where(lt(imageGenerations.createdAt, cutoffDate));

        // Delete old database records
        await db
            .delete(imageGenerations)
            .where(lt(imageGenerations.createdAt, cutoffDate));

        // Delete corresponding files
        for (const generation of oldGenerations) {
            const filePath = path.join(
                process.cwd(),
                'public',
                generation.imageUrl.replace(/^\//, '')
            );

            try {
                await fs.unlink(filePath);
            } catch (fileError) {
                console.error(`Failed to delete file ${filePath}:`, fileError);
            }
        }

        console.log(`Cleaned up ${oldGenerations.length} old image generations`);
    } catch (error) {
        console.error('Error during generations cleanup:', error);
    }
}

export default cleanupOldGenerations;