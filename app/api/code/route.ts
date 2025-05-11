// app/api/code/route.ts
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const instructionMessage = {
  role: "system",
  content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return new NextResponse("Gemini API Key not configured", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    // Format messages for Gemini
    const formattedPrompt = `${instructionMessage.content}\n\n${messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;

    // Use Gemini 1.5 Flash or Pro instead of deprecated gemini-pro
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(formattedPrompt);
    const response = await result.response;
    const codeResponse = response.text();

    // Save to database
    try {
      // Check if user exists, if not create one
      let dbUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkId, userId)
      });

      if (!dbUser) {
        const [newUser] = await db.insert(schema.users).values({
          clerkId: userId,
          email: 'user@example.com',
          firstName: 'User',
          lastName: 'Name'
        }).returning();
        dbUser = newUser;
      }

      // Save code generation to database
      await db.insert(schema.codeGenerations).values({
        userId: dbUser.id,
        prompt: messages[messages.length - 1].content,
        generatedCode: codeResponse,
        language: 'auto-detect',
        metadata: {
          model: 'gemini-1.5-flash',
          conversationHistory: messages,
          timestamp: new Date()
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      role: "assistant",
      content: codeResponse
    });
  } catch (error) {
    console.error("[CODE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}