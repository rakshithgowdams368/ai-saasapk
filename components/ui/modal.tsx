// components/ui/modal.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  children,
  className,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!mounted) return null;
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in-0"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={cn(
            "relative w-full bg-gray-900 border border-gray-800 rounded-lg shadow-xl",
            "transform transition-all duration-200 ease-out",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4",
            sizeClasses[size],
            className
          )}
          role="dialog"
          aria-modal="true"
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-white" />
              <span className="sr-only">Close</span>
            </button>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal Header
const ModalHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("px-6 pt-6 pb-4", className)}>
    {children}
  </div>
);

// Modal Title
const ModalTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("text-xl font-semibold text-white", className)}>
    {children}
  </h2>
);

// Modal Description
const ModalDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-sm text-gray-400 mt-1", className)}>
    {children}
  </p>
);

// Modal Body
const ModalBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("px-6 py-4", className)}>
    {children}
  </div>
);

// Modal Footer
const ModalFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("px-6 py-4 bg-gray-800/50 border-t border-gray-800 flex justify-end gap-2", className)}>
    {children}
  </div>
);

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
};

// Example usage component for billing history modal
export const BillingHistoryModal = ({ 
  isOpen, 
  onClose,
  billingHistory 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  billingHistory?: any[];
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>Billing History</ModalTitle>
        <ModalDescription>
          View and download your invoice history
        </ModalDescription>
      </ModalHeader>
      
      <ModalBody>
        <div className="space-y-4">
          {billingHistory?.map((invoice, index) => (
            <div 
              key={invoice.id || index}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
            >
              <div>
                <p className="font-medium text-white">Invoice #{invoice.invoiceNumber}</p>
                <p className="text-sm text-gray-400">
                  {new Date(invoice.date).toLocaleDateString()} - ${invoice.amount}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* View PDF logic */}}
                >
                  View PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Download logic */}}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
          
          {(!billingHistory || billingHistory.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              No billing history available
            </div>
          )}
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// Example usage component for subscription modal  
export const SubscriptionModal = ({ 
  isOpen, 
  onClose,
  currentPlan,
  onSelectPlan
}: { 
  isOpen: boolean; 
  onClose: () => void;
  currentPlan?: string;
  onSelectPlan: (plan: string) => void;
}) => {
  const plans = [
    { id: 'free', name: 'Free', price: '$0', features: ['5 generations/day', 'Basic quality'] },
    { id: 'basic', name: 'Basic', price: '$9', features: ['25 generations/day', 'Enhanced quality', 'Priority support'] },
    { id: 'pro', name: 'Pro', price: '$29', features: ['Unlimited generations', 'Maximum quality', 'API access', 'Priority support'] }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>
        <ModalTitle>Choose Your Plan</ModalTitle>
        <ModalDescription>
          Select the plan that best fits your needs
        </ModalDescription>
      </ModalHeader>
      
      <ModalBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={cn(
                "p-6 rounded-lg border",
                currentPlan === plan.id 
                  ? "border-purple-500 bg-purple-500/10" 
                  : "border-gray-700 bg-gray-800"
              )}
            >
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="text-2xl font-bold text-white mt-2">{plan.price}<span className="text-sm text-gray-400">/month</span></p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full mt-6" 
                variant={currentPlan === plan.id ? "secondary" : "default"}
                onClick={() => onSelectPlan(plan.id)}
                disabled={currentPlan === plan.id}
              >
                {currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
              </Button>
            </div>
          ))}
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};