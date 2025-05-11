// lib/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Get user by Clerk ID
export async function getUserByClerkId(clerkId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.clerkId, clerkId)
    });
    return user;
  } catch (error) {
    console.error('Error getting user by Clerk ID:', error);
    return null;
  }
}

// Create user if doesn't exist
export async function createUserIfNotExists(clerkUser: any) {
  try {
    const existingUser = await getUserByClerkId(clerkUser.id);
    
    if (existingUser) {
      return existingUser;
    }

    const [newUser] = await db.insert(schema.users).values({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      imageUrl: clerkUser.imageUrl || '',
    }).returning();

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update saveGeneration function
export async function saveGeneration(type: 'image' | 'video' | 'audio' | 'code' | 'conversation', data: any) {
  try {
    console.log('Attempting to save generation:', { type, data });
    
    const table = {
      image: schema.imageGenerations,
      video: schema.videoGenerations,
      audio: schema.audioGenerations,
      code: schema.codeGenerations,
      conversation: schema.conversations,
    }[type];

    // If userId is a Clerk ID, convert it to database user ID
    let userId = data.userId;
    if (data.userId && data.userId.startsWith('user_')) {
      const user = await getUserByClerkId(data.userId);
      if (!user) {
        console.error('User not found for Clerk ID:', data.userId);
        // Try to create the user
        const { currentUser } = await import("@clerk/nextjs");
        const clerkUser = await currentUser();
        if (clerkUser && clerkUser.id === data.userId) {
          const newUser = await createUserIfNotExists(clerkUser);
          userId = newUser.id;
        } else {
          throw new Error('User not found and cannot be created');
        }
      } else {
        userId = user.id;
      }
      console.log('Converted Clerk ID to database ID:', { clerkId: data.userId, dbId: userId });
    }

    // Remove the userId from data to avoid overwriting
    const { userId: _, ...restData } = data;

    const result = await db.insert(table).values({
      ...restData,
      userId
    }).returning();

    console.log('Generation saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving generation:', error);
    throw error;
  }
}