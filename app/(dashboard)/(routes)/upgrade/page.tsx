"use client";

import { useState } from "react";
import { Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { SUBSCRIPTION_PLANS } from "./constants";

export default function UpgradePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") return;
    
    setLoading(planId);
    try {
      // Redirect to WhatsApp with predefined message
      const phoneNumber = "7975026414";
      const message = `Hi! I want to upgrade to the Premium License for your software. My email is ${user?.primaryEmailAddress?.emailAddress || ""}`;
      const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappURL, "_blank");
      
      toast.success("Redirecting to WhatsApp...");
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to redirect to WhatsApp");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
          Upgrade Your Experience
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Choose the perfect plan for your needs and unlock the full potential
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 ${
              plan.popular 
                ? "border-purple-500 dark:border-purple-400" 
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            {plan.popular && (
              <div className="absolute -right-12 top-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-1 rotate-45 text-sm font-medium shadow-md">
                Best Value
              </div>
            )}
            
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-2xl">
                {plan.name}
                {plan.popular && <Zap className="h-5 w-5 text-yellow-400" />}
              </CardTitle>
              <CardDescription className="text-base">{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pb-6">
              <div className="mb-6 flex items-end">
                <span className="text-4xl sm:text-5xl font-bold">{plan.price}</span>
                {plan.interval !== "forever" && (
                  <span className="text-slate-500 dark:text-slate-400 ml-2 mb-1">
                    {plan.interval === "one-time" ? "one-time payment" : `/${plan.interval}`}
                  </span>
                )}
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`${
                      feature.included 
                        ? "text-slate-700 dark:text-slate-200" 
                        : "text-slate-400 dark:text-slate-500"
                    }`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button
                className={`w-full py-6 text-lg font-medium transition-all duration-300 ${
                  plan.id !== "free" 
                    ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 shadow-lg hover:shadow-xl` 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                variant={plan.id === "free" ? "outline" : "default"}
                disabled={plan.id === "free" || loading === plan.id}
                onClick={() => handleUpgrade(plan.id)}
              >
                {loading === plan.id ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-100">How does the premium license work?</h3>
            <p className="text-slate-600 dark:text-slate-300">
              The premium license is a one-time payment that gives you lifetime access to all 
              features and future updates of the software. No recurring payments or subscriptions.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-100">What payment methods do you accept?</h3>
            <p className="text-slate-600 dark:text-slate-300">
              After contacting us on WhatsApp, we'll provide details for various payment options including 
              credit/debit cards, PayPal, bank transfer, and mobile payment methods.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-100">Can I request a refund?</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Yes, we offer a 30-day money-back guarantee if you're not satisfied with the software. 
              Simply contact us through WhatsApp with your purchase details.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-100">How do I get support?</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Premium users receive priority support through WhatsApp and email. 
              Free users can access community support through our forums.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center p-6 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-purple-800 dark:text-purple-300">Not Ready to Upgrade?</h2>
        <p className="text-slate-700 dark:text-slate-300 mb-6">
          Try the free plan and experience our core features. You can upgrade anytime when you need more power.
        </p>
        <Button 
          variant="outline"
          className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-purple-300 dark:border-purple-800"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Try Free Plan
        </Button>
      </div>
    </div>
  );
}