// app/api/subscription/route.ts
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db, getUserByClerkId, getUserSubscription } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET current subscription
export async function GET(req: Request) {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await getUserByClerkId(userId);
        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const subscription = await getUserSubscription(user.id);

        return NextResponse.json(subscription);
    } catch (error) {
        console.error("[SUBSCRIPTION_GET_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

// Cancel subscription
export async function POST(req: Request) {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await getUserByClerkId(userId);
        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const subscription = await getUserSubscription(user.id);
        if (!subscription) {
            return new NextResponse("No active subscription found", { status: 404 });
        }

        // Update subscription status to cancelled
        await db.update(schema.subscriptions)
            .set({ 
                status: 'cancelled',
                endDate: new Date(),
                updatedAt: new Date()
            })
            .where(eq(schema.subscriptions.id, subscription.id));

        return NextResponse.json({ 
            success: true,
            message: "Subscription cancelled successfully"
        });

    } catch (error) {
        console.error("[SUBSCRIPTION_CANCEL_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}