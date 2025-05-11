// types/subscription.ts

// Subscription plans
export type PlanType = 'free' | 'basic' | 'pro';
export type BillingInterval = 'month' | 'year' | 'lifetime';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

export interface PlanFeature {
  name: string;
  included: boolean;
  value?: string | number;
}

export interface SubscriptionPlan {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  features: PlanFeature[];
  limits: {
    imageGenerations: number | 'unlimited';
    videoGenerations: number | 'unlimited';
    audioGenerations: number | 'unlimited';
    codeGenerations: number | 'unlimited';
    conversations: number | 'unlimited';
    storage: number | 'unlimited'; // in GB
    apiCalls: number | 'unlimited';
  };
  popular?: boolean;
  buttonText: string;
  gradient: string;
}

// User subscription
export interface UserSubscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  amount: number;
  currency: string;
  paypalSubscriptionId?: string;
  autoRenew: boolean;
}

// Billing information
export interface BillingInfo {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paypalEmail?: string;
  paypalPayerId?: string;
}

// Invoice
export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'void' | 'failed';
  items: InvoiceItem[];
  issuedDate: Date;
  dueDate: Date;
  paidDate?: Date;
  paypalPaymentId?: string;
  pdfUrl?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Payment method
export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'paypal' | 'credit_card';
  isDefault: boolean;
  paypalEmail?: string;
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// Usage tracking
export interface UsageStats {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  imageGenerations: number;
  videoGenerations: number;
  audioGenerations: number;
  codeGenerations: number;
  conversations: number;
  storageUsed: number; // in bytes
  apiCalls: number;
}

// PayPal API types
export interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED';
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    description?: string;
  }>;
  payer?: {
    email_address?: string;
    payer_id?: string;
  };
}

export interface PayPalSubscription {
  id: string;
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  plan_id: string;
  start_time: string;
  subscriber: {
    email_address?: string;
    payer_id?: string;
  };
  billing_info: {
    outstanding_balance: {
      currency_code: string;
      value: string;
    };
    next_billing_time?: string;
  };
}

// Subscription events
export interface SubscriptionEvent {
  id: string;
  userId: string;
  type: 'created' | 'upgraded' | 'downgraded' | 'cancelled' | 'renewed' | 'expired' | 'payment_failed';
  planFrom?: PlanType;
  planTo?: PlanType;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Pricing table for display
export interface PricingPlan {
  id: PlanType;
  name: string;
  description: string;
  price: string;
  interval: string;
  features: Array<{
    name: string;
    included: boolean;
  }>;
  gradient: string;
  popular: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'gradient';
}

// Checkout session
export interface CheckoutSession {
  id: string;
  userId: string;
  planId: PlanType;
  status: 'pending' | 'completed' | 'failed';
  paypalOrderId?: string;
  amount: number;
  currency: string;
  createdAt: Date;
  expiresAt: Date;
}