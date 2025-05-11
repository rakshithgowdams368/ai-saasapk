// lib/email/smtp.ts
import nodemailer from 'nodemailer';
import { ContactMessage } from '@/types/database';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Email templates
const generateContactEmailTemplate = (contact: ContactMessage) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a5568; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f7fafc; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #4a5568; }
        .value { color: #2d3748; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Contact Message - NexusAI</h2>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${contact.firstName} ${contact.lastName}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${contact.email}</div>
          </div>
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value">${contact.phone}</div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${contact.message}</div>
          </div>
          <div class="field">
            <div class="label">Submitted On:</div>
            <div class="value">${new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send contact form email
export async function sendContactFormEmail(contact: ContactMessage) {
  try {
    const mailOptions = {
      from: `"NexusAI Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `New Contact Message from ${contact.firstName} ${contact.lastName}`,
      html: generateContactEmailTemplate(contact),
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

// Send welcome email
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    const mailOptions = {
      from: `"NexusAI" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Welcome to NexusAI!',
      html: `
        <h1>Welcome to NexusAI, ${userName}!</h1>
        <p>Thank you for joining us. You now have access to powerful AI tools for content generation.</p>
        <p>Start exploring:</p>
        <ul>
          <li>Image Generation</li>
          <li>Video Creation</li>
          <li>Code Generation</li>
          <li>Audio Creation</li>
          <li>AI Conversations</li>
        </ul>
        <p>Visit your dashboard to get started!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Welcome email failed:', error);
    return { success: false, error };
  }
}

// Send generation completion email
export async function sendGenerationCompleteEmail(userEmail: string, generationType: string, generationId: string) {
  try {
    const mailOptions = {
      from: `"NexusAI" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Your ${generationType} generation is ready!`,
      html: `
        <h1>Your ${generationType} is ready!</h1>
        <p>Your ${generationType} generation has been completed successfully.</p>
        <p>Generation ID: ${generationId}</p>
        <p>You can view it in your dashboard.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Generation complete email failed:', error);
    return { success: false, error };
  }
}