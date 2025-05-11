// app/api/payment/create-order/route.ts
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { paypalClient } from "@/lib/paypal/client";
import { db, getUserByClerkId } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { planId, amount } = body;

        if (!planId || !amount) {
            return new NextResponse("Plan ID and amount are required", { status: 400 });
        }

        // Get user from database
        const user = await getUserByClerkId(userId);
        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Create PayPal order
        const order = await paypalClient.createOrder(amount, 'USD');

        // Return order details with approval URL
        const approvalUrl = order.links?.find(link => link.rel === 'approve')?.href;

        return NextResponse.json({
            success: true,
            orderId: order.id,
            approvalUrl,
        });

    } catch (error) {
        console.error("[PAYMENT_CREATE_ORDER_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}