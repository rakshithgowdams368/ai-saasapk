// app/api/email/contact/route.ts
import { NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email/smtp";
import { createContactMessage } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { sendEmailToOwner } from "@/components/owneremail";

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { firstName, lastName, email, phone, message } = body;

        // Validate input
        if (!firstName || !lastName || !email || !phone || !message) {
            return new NextResponse("All fields are required", { status: 400 });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new NextResponse("Invalid email address", { status: 400 });
        }

        // Save to database
        const savedMessage = await createContactMessage({
            firstName,
            lastName,
            email,
            phone,
            message,
            userId: userId || undefined,
        });

        // Prepare email data
        const emailData = {
            firstName,
            lastName,
            email,
            phone,
            message,
            submittedAt: new Date(),
            userAgent: req.headers.get('user-agent') || undefined,
            ipAddress: req.headers.get('x-forwarded-for') || undefined,
        };

        // Send email
        const result = await sendContactFormEmail(emailData);

        if (!result.success) {
            console.error("Failed to send contact email");
            // Still return success if message was saved to DB
        }

        return NextResponse.json({
            success: true,
            message: "Contact form submitted successfully",
            data: savedMessage
        });

    } catch (error) {
        console.error("[CONTACT_EMAIL_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}