// app/api/payment/capture-order/route.ts
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { paypalClient } from "@/lib/paypal/client";
import { db, createSubscription, createInvoice, getUserByClerkId } from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/utils";

export async function GET(req: Request) {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('token');
        const payerId = searchParams.get('PayerID');

        if (!orderId) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/upgrade?error=missing_order`);
        }

        // Get user from database
        const user = await getUserByClerkId(userId);
        if (!user) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/upgrade?error=user_not_found`);
        }

        // Capture the order
        const captureData = await paypalClient.captureOrder(orderId);

        if (captureData.status !== 'COMPLETED') {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/upgrade?error=payment_failed`);
        }

        // Extract payment details
        const purchase = captureData.purchase_units[0];
        const amount = parseFloat(purchase.payments.captures[0].amount.value);
        const paypalPaymentId = captureData.id;

        // Determine plan based on amount
        let plan: 'basic' | 'pro' = 'basic';
        if (amount === 29) {
            plan = 'pro';
        }

        // Create subscription
        const subscription = await createSubscription(user.id, plan, amount, paypalPaymentId);

        // Create invoice
        const invoiceData = {
            userId: user.id,
            subscriptionId: subscription[0].id,
            amount,
            invoiceNumber: generateInvoiceNumber(),
            invoiceJson: {
                user: {
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email,
                },
                items: [
                    {
                        description: `NexusAI ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                        quantity: 1,
                        unitPrice: amount,
                        total: amount,
                    }
                ],
                subtotal: amount,
                tax: 0,
                total: amount,
            },
            paypalPaymentId,
        };

        await createInvoice(invoiceData);

        // Redirect to success page
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/upgrade?success=true`);

    } catch (error) {
        console.error("[PAYMENT_CAPTURE_ORDER_ERROR]", error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/upgrade?error=capture_failed`);
    }
}