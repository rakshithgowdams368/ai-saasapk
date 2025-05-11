// hooks/use-subscription.ts
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserSubscription, SubscriptionPlan } from '@/types/subscription';

export function useSubscription() {
    const { user } = useUser();
    const queryClient = useQueryClient();

    // Fetch user's current subscription
    const { data: subscription, isLoading: subscriptionLoading } = useQuery({
        queryKey: ['subscription', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const response = await axios.get<UserSubscription>('/api/subscription');
            return response.data;
        },
        enabled: !!user?.id,
    });

    // Fetch available plans
    const { data: plans, isLoading: plansLoading } = useQuery({
        queryKey: ['plans'],
        queryFn: async () => {
            const response = await axios.get<SubscriptionPlan[]>('/api/subscription/plans');
            return response.data;
        },
    });

    // Create subscription mutation
    const createSubscription = useMutation({
        mutationFn: async (planId: string) => {
            const response = await axios.post('/api/subscription/create', { planId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        },
    });

    // Cancel subscription mutation
    const cancelSubscription = useMutation({
        mutationFn: async () => {
            const response = await axios.post('/api/subscription/cancel');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        },
    });

    // Upgrade subscription mutation
    const upgradeSubscription = useMutation({
        mutationFn: async (planId: string) => {
            const response = await axios.post('/api/subscription/upgrade', { planId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        },
    });

    // Check if user has access to a feature
    const hasFeatureAccess = (feature: string): boolean => {
        if (!subscription) return false;

        // Free plan limitations
        if (subscription.plan === 'free') {
            const freeLimits = {
                imageGeneration: true,
                videoGeneration: false,
                highResolution: false,
                apiAccess: false,
                prioritySupport: false,
            };
            return freeLimits[feature] || false;
        }

        // Basic plan limitations
        if (subscription.plan === 'basic') {
            const basicLimits = {
                imageGeneration: true,
                videoGeneration: true,
                highResolution: true,
                apiAccess: false,
                prioritySupport: false,
            };
            return basicLimits[feature] || false;
        }

        // Pro plan has all features
        return true;
    };

    // Get current plan details
    const currentPlan = plans?.find(plan => plan.id === subscription?.plan);

    // Check if subscription is active
    const isSubscriptionActive = subscription?.status === 'active';

    // Get days remaining
    const daysRemaining = subscription?.endDate
        ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return {
        subscription,
        plans,
        currentPlan,
        isLoading: subscriptionLoading || plansLoading,
        isSubscriptionActive,
        daysRemaining,
        hasFeatureAccess,
        createSubscription: createSubscription.mutate,
        cancelSubscription: cancelSubscription.mutate,
        upgradeSubscription: upgradeSubscription.mutate,
        isCreating: createSubscription.isPending,
        isCanceling: cancelSubscription.isPending,
        isUpgrading: upgradeSubscription.isPending,
    };
}

// Hook for managing subscription usage
export function useSubscriptionUsage() {
    const { user } = useUser();
    const { subscription, currentPlan } = useSubscription();

    const { data: usage, isLoading } = useQuery({
        queryKey: ['subscription-usage', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const response = await axios.get('/api/subscription/usage');
            return response.data;
        },
        enabled: !!user?.id,
    });

    // Check if user has reached limit for a feature
    const hasReachedLimit = (feature: string): boolean => {
        if (!usage || !currentPlan?.limits) return false;

        const limit = currentPlan.limits[feature];
        const current = usage[feature] || 0;

        return limit !== 'unlimited' && current >= limit;
    };

    // Get remaining quota for a feature
    const getRemainingQuota = (feature: string): number | 'unlimited' => {
        if (!usage || !currentPlan?.limits) return 0;

        const limit = currentPlan.limits[feature];
        if (limit === 'unlimited') return 'unlimited';

        const current = usage[feature] || 0;
        return Math.max(0, limit - current);
    };

    return {
        usage,
        isLoading,
        hasReachedLimit,
        getRemainingQuota,
    };
}

// Hook for PayPal integration
export function usePayPal() {
    const { user } = useUser();
    const queryClient = useQueryClient();

    // Create PayPal order
    const createOrder = useMutation({
        mutationFn: async (planId: string) => {
            const response = await axios.post('/api/payment/create-order', {
                planId,
            });
            return response.data;
        },
    });

    // Capture PayPal order
    const captureOrder = useMutation({
        mutationFn: async (orderId: string) => {
            const response = await axios.post('/api/payment/capture-order', {
                orderId,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        },
    });

    return {
        createOrder: createOrder.mutate,
        captureOrder: captureOrder.mutate,
        isCreatingOrder: createOrder.isPending,
        isCapturingOrder: captureOrder.isPending,
        orderData: createOrder.data,
    };
}