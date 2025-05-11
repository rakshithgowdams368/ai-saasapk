// app/api/conversation/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get AI response
    const prompt = messages.map((msg: any) => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Save to database
    try {
      // First check if user exists, if not create one
      let dbUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkId, userId)
      });

      if (!dbUser) {
        const [newUser] = await db.insert(schema.users).values({
          clerkId: userId,
          email: 'user@example.com', // You can get this from Clerk if needed
          firstName: 'User',
          lastName: 'Name'
        }).returning();
        dbUser = newUser;
      }

      // Save conversation
      await db.insert(schema.conversations).values({
        userId: dbUser.id,
        messages: [...messages, { role: "assistant", content: text }],
        model: "gemini-1.5-flash",
        sessionId: `session_${Date.now()}`
      });

    } catch (dbError) {
      console.error("Database error:", dbError);
      // Continue even if saving fails
    }

    return NextResponse.json({
      role: "assistant",
      content: text,
    });

  } catch (error) {
    console.error("Conversation error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}