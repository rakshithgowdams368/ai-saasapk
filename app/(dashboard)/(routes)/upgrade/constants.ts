// app/(dashboard)/(routes)/upgrade/constants.ts

export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  interval: string;
  features: PlanFeature[];
  popular: boolean;
  buttonText: string;
  gradient: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free Plan",
    description: "Basic features for personal use",
    price: "$0",
    interval: "forever",
    features: [
      { name: "25 generations/day", included: true },
      { name: "Basic quality export", included: true },
      { name: "Standard support", included: true },
      { name: "Community access", included: true },
      { name: "1 project limit", included: true },
      { name: "Basic templates", included: true },
      { name: "Advanced features", included: false },
      { name: "Unlimited projects", included: false },
      { name: "Priority support", included: false },
      { name: "Commercial usage", included: false }
    ],
    popular: false,
    buttonText: "Current Plan",
    gradient: "from-gray-500 to-gray-700"
  },
  {
    id: "premium",
    name: "Premium License",
    description: "Full software access forever",
    price: "$99",
    interval: "one-time",
    features: [
      { name: "Unlimited generations", included: true },
      { name: "Maximum quality export", included: true },
      { name: "Priority support", included: true },
      { name: "Full community access", included: true },
      { name: "Unlimited projects", included: true },
      { name: "All premium templates", included: true },
      { name: "All advanced features", included: true },
      { name: "Commercial usage rights", included: true },
      { name: "Priority support", included: true },
      { name: "Lifetime updates", included: true }
    ],
    popular: true,
    buttonText: "Upgrade Now",
    gradient: "from-purple-600 to-blue-600"
  }
];