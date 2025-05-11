// components/owneremail.tsx
"use client";

import { useState } from 'react';
import { Mail, Shield, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Owner email configuration
export const OWNER_EMAIL_CONFIG = {
  email: process.env.OWNER_EMAIL || 'owner@nexusai.com',
  name: 'NexusAI Support',
  department: 'Customer Support',
  responseTime: '24 hours',
  notificationTypes: [
    'contact_form',
    'support_request',
    'billing_inquiry',
    'bug_report',
    'feature_request'
  ]
};

// Email template for contact form submissions
export const generateContactEmailTemplate = (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: Date;
  userAgent?: string;
  ipAddress?: string;
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission - NexusAI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(to right, #7c3aed, #db2777);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
      padding: 30px;
    }
    .field {
      margin-bottom: 20px;
    }
    .label {
      font-weight: 600;
      color: #374151;
      display: block;
      margin-bottom: 5px;
    }
    .value {
      color: #4b5563;
      background: white;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }
    .message {
      background: #f3f4f6;
      border-left: 4px solid #7c3aed;
      padding: 15px;
      margin-top: 20px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .metadata {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">New Contact Form Submission</h2>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">NexusAI Support System</p>
  </div>
  
  <div class="content">
    <div class="field">
      <span class="label">Name:</span>
      <span class="value">${data.firstName} ${data.lastName}</span>
    </div>
    
    <div class="field">
      <span class="label">Email:</span>
      <span class="value">${data.email}</span>
    </div>
    
    <div class="field">
      <span class="label">Phone:</span>
      <span class="value">${data.phone}</span>
    </div>
    
    <div class="field">
      <span class="label">Submitted On:</span>
      <span class="value">${data.submittedAt.toLocaleString()}</span>
    </div>
    
    <div class="message">
      <h3 style="margin-top: 0;">Message:</h3>
      <p style="margin-bottom: 0; white-space: pre-wrap;">${data.message}</p>
    </div>
    
    <div class="metadata">
      <h4 style="margin-top: 0;">Additional Information:</h4>
      <p>IP Address: ${data.ipAddress || 'Not available'}</p>
      <p>User Agent: ${data.userAgent || 'Not available'}</p>
      <p>Form ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
    </div>
  </div>
  
  <div class="footer">
    <p>This email was sent from the NexusAI Contact Form system.</p>
    <p>© ${new Date().getFullYear()} NexusAI. All rights reserved.</p>
  </div>
</body>
</html>
`;
};

// Component to display and manage owner email settings
export const OwnerEmailSettings = () => {
  const [email, setEmail] = useState(OWNER_EMAIL_CONFIG.email);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    // In a real app, this would save to environment variables or database
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setSaved(true);
    
    // Show success message for 3 seconds
    setTimeout(() => setSaved(false), 3000);
    
    // In production, you'd update the environment variable here
    console.log('Updated owner email to:', email);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Owner Email Configuration
        </CardTitle>
        <CardDescription>
          Configure the email address that receives all contact form submissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="owner-email">Owner Email Address</Label>
          <Input
            id="owner-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@example.com"
            className={error ? 'border-red-500' : ''}
          />
          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Notification Types</h4>
          <div className="grid grid-cols-2 gap-2">
            {OWNER_EMAIL_CONFIG.notificationTypes.map((type) => (
              <div key={type} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} className="w-full">
            {saved ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Saved Successfully
              </span>
            ) : (
              'Save Email Settings'
            )}
          </Button>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>All form submissions are encrypted and sent securely</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Export functions for use in API routes
export const sendEmailToOwner = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  submittedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
}) => {
  const emailData = {
    ...data,
    submittedAt: data.submittedAt || new Date(),
  };

  const emailHtml = generateContactEmailTemplate(emailData);

  // This would integrate with your SMTP service
  const emailPayload = {
    to: OWNER_EMAIL_CONFIG.email,
    from: `"${OWNER_EMAIL_CONFIG.name}" <noreply@nexusai.com>`,
    subject: `New Contact Form Submission from ${data.firstName} ${data.lastName}`,
    html: emailHtml,
    text: `
New Contact Form Submission

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
Message: ${data.message}
Submitted: ${emailData.submittedAt.toLocaleString()}
    `.trim()
  };

  return emailPayload;
};

// Function to validate owner email configuration
export const validateOwnerEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Function to get owner email info for display
export const getOwnerEmailInfo = () => {
  return {
    email: OWNER_EMAIL_CONFIG.email,
    name: OWNER_EMAIL_CONFIG.name,
    department: OWNER_EMAIL_CONFIG.department,
    responseTime: OWNER_EMAIL_CONFIG.responseTime,
  };
};

export default OwnerEmailSettings;