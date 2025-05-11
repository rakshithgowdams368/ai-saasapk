// components/billing/payment-button.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface PaymentButtonProps {
  planId: 'basic' | 'pro';
  planName: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function PaymentButton({
  planId,
  planName,
  amount,
  onSuccess,
  onError,
  className,
  children
}: PaymentButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create PayPal order
      const { data: orderData } = await axios.post('/api/payment/create-order', {
        planId,
        amount,
      });

      if (!orderData.success || !orderData.orderId) {
        throw new Error('Failed to create payment order');
      }

      // Redirect to PayPal
      window.location.href = orderData.approvalUrl;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handlePayment}
        disabled={loading}
        className={className || "w-full"}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {children || `Upgrade to ${planName}`}
          </>
        )}
      </Button>
      
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-500">
          <AlertCircle className="mr-1 h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

// Special button for free plan
export function FreePlanButton({ onSelect }: { onSelect?: () => void }) {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={onSelect}
      disabled
    >
      Current Plan
    </Button>
  );
}

// Subscription management button
export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      // In a real app, this would redirect to PayPal subscription management
      router.push('/profile#subscription');
    } catch (error) {
      console.error('Failed to manage subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleManageSubscription}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        'Manage Subscription'
      )}
    </Button>
  );
}

// Cancel subscription button
export function CancelSubscriptionButton({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post('/api/subscription/cancel');

      if (!data.success) {
        throw new Error('Failed to cancel subscription');
      }

      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="destructive"
        onClick={handleCancel}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Canceling...
          </>
        ) : (
          'Cancel Subscription'
        )}
      </Button>
      
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-500">
          <AlertCircle className="mr-1 h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export default PaymentButton;