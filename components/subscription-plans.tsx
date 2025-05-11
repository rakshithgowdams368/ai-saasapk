//file path :-ai-saas-antonio-main/components/subscription-plans.tsx
"use client";

import { useState, useEffect } from "react";
import { Check, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Plan data
const SUBSCRIPTION_PLANS = [
    {
        id: "free",
        name: "Free",
        description: "Basic features for personal projects",
        price: "$0",
        interval: "forever",
        features: [
            { name: "5 generations/day", included: true },
            { name: "Basic quality", included: true },
            { name: "Standard response time", included: true },
            { name: "Community support", included: true },
            { name: "720p image resolution", included: true },
            { name: "Basic editing tools", included: true },
            { name: "Basic templates", included: true },
            { name: "Advanced quality settings", included: false },
            { name: "Priority support", included: false },
            { name: "API access", included: false }
        ],
        gradient: "from-gray-500 to-gray-700",
        popular: false,
        buttonText: "Current Plan",
        buttonVariant: "outline"
    },
    {
        id: "basic",
        name: "Basic",
        description: "Enhanced features for growing needs",
        price: "$9",
        interval: "month",
        features: [
            { name: "25 generations/day", included: true },
            { name: "Enhanced quality", included: true },
            { name: "Fast response time", included: true },
            { name: "Email support", included: true },
            { name: "1080p image resolution", included: true },
            { name: "Advanced editing tools", included: true },
            { name: "Premium templates", included: true },
            { name: "Advanced quality settings", included: true },
            { name: "Priority support", included: false },
            { name: "API access", included: false }
        ],
        gradient: "from-blue-500 to-cyan-500",
        popular: false,
        buttonText: "Upgrade to Basic",
        buttonVariant: "gradient"
    },
    {
        id: "pro",
        name: "Pro",
        description: "Premium features for professional creators",
        price: "$29",
        interval: "month",
        features: [
            { name: "Unlimited generations", included: true },
            { name: "Maximum quality", included: true },
            { name: "Instant response time", included: true },
            { name: "Priority support", included: true },
            { name: "4K image resolution", included: true },
            { name: "Professional editing suite", included: true },
            { name: "Custom templates", included: true },
            { name: "Advanced quality settings", included: true },
            { name: "Priority support", included: true },
            { name: "Full API access", included: true }
        ],
        gradient: "from-purple-500 to-pink-500",
        popular: true,
        buttonText: "Upgrade to Pro",
        buttonVariant: "gradient"
    }
];

const SubscriptionPlans = ({ currentPlan = "free" }) => {
    const [mounted, setMounted] = useState(false);
    const [animateFeature, setAnimateFeature] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);

        // Randomly animate a pro feature every few seconds
        const interval = setInterval(() => {
            const proFeatures = SUBSCRIPTION_PLANS.find(plan => plan.id === "pro")?.features || [];
            const proOnlyFeatures = proFeatures
                .filter(feature => feature.included)
                .map(feature => feature.name);

            if (proOnlyFeatures.length > 0) {
                const randomFeature = proOnlyFeatures[Math.floor(Math.random() * proOnlyFeatures.length)];
                setAnimateFeature(randomFeature);

                // Reset animation after a short delay
                setTimeout(() => {
                    setAnimateFeature(null);
                }, 1000);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                    Choose Your Plan
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Select the perfect plan that matches your needs. Upgrade or downgrade at any time.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {SUBSCRIPTION_PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={cn(
                            "rounded-xl overflow-hidden border bg-gray-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                            plan.popular ? "border-purple-500 shadow-lg shadow-purple-500/10" : "border-gray-800",
                            plan.id === currentPlan ? "ring-2 ring-purple-500" : ""
                        )}
                    >
                        {/* Plan header */}
                        <div
                            className={cn(
                                "p-6 relative",
                                plan.popular ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20" : "bg-gray-900"
                            )}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute -top-1 right-0 transform translate-y-px">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-bl-lg rounded-br-lg font-medium shadow-lg">
                                        MOST POPULAR
                                    </div>
                                </div>
                            )}

                            {/* Plan name and price */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                                    {plan.id === "pro" ? (
                                        <Zap size={14} className="text-white" />
                                    ) : (
                                        <div className="w-3 h-3 rounded-full bg-white" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                            </div>

                            <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                            <div className="flex items-baseline mb-1">
                                <span className="text-3xl font-bold">{plan.price}</span>
                                {plan.interval !== "forever" && (
                                    <span className="text-gray-400 ml-1">/{plan.interval}</span>
                                )}
                            </div>

                            {plan.id === currentPlan && (
                                <div className="text-xs text-purple-400 font-medium">
                                    Your current plan
                                </div>
                            )}
                        </div>

                        {/* Plan features */}
                        <div className="p-6">
                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature.name}
                                        className={cn(
                                            "flex items-start gap-2 text-sm",
                                            animateFeature === feature.name ? "animate-pulse" : ""
                                        )}
                                    >
                                        {feature.included ? (
                                            <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <X size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                                        )}
                                        <span className={feature.included ? "text-gray-200" : "text-gray-500"}>
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Plan action */}
                        <div className="p-6 pt-0">
                            <Button
                                className={cn(
                                    "w-full",
                                    plan.buttonVariant === "gradient" ?
                                        `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white` :
                                        "border-gray-700 hover:bg-gray-800 text-gray-300"
                                )}
                                disabled={plan.id === currentPlan}
                            >
                                {plan.buttonText}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <p className="text-gray-400 text-sm mb-4">
                    All plans include: Secure cloud storage, regular feature updates, and multi-device access
                </p>

                <div className="inline-flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg">
                    <Zap size={16} className="text-purple-400" />
                    <span className="text-sm text-gray-300">Need a custom plan for your team? <span className="text-purple-400 font-medium cursor-pointer hover:underline">Contact Sales</span></span>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlans;