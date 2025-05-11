// app/(auth)/(routes)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp 
      appearance={{
        elements: {
          formButtonPrimary: 
            "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0",
          card: "bg-gray-900 border border-gray-800 shadow-xl",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: 
            "bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:border-gray-600",
          socialButtonsBlockButtonText: "text-gray-300",
          dividerLine: "bg-gray-700",
          dividerText: "text-gray-400",
          formFieldLabel: "text-gray-300",
          formFieldInput: 
            "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500",
          footerActionLink: 
            "text-purple-400 hover:text-purple-300",
          footerActionText: "text-gray-400",
          identityPreviewText: "text-gray-300",
          identityPreviewEditButton: "text-purple-400 hover:text-purple-300",
          formHeaderTitle: "text-white",
          formHeaderSubtitle: "text-gray-400",
          formResendCodeLink: "text-purple-400 hover:text-purple-300",
          otpCodeFieldInput: "bg-gray-800 border-gray-700 text-white",
          formFieldAction: "text-purple-400 hover:text-purple-300",
          formFieldSuccessText: "text-green-400",
          formFieldErrorText: "text-red-400",
          alert: "bg-gray-800 border-gray-700",
          alertText: "text-gray-300",
        },
        variables: {
          colorPrimary: "#8b5cf6",
          colorText: "white",
          colorTextSecondary: "#9ca3af",
          colorInputBackground: "#1f2937",
          colorInputText: "white",
          colorBackground: "#111827",
          fontFamily: "inter",
        },
        layout: {
          socialButtonsPlacement: "top",
          socialButtonsVariant: "blockButton",
          privacyPageUrl: "/privacy",
          termsPageUrl: "/terms",
          helpPageUrl: "/help",
          logoPlacement: "inside",
          showOptionalFields: true,
        },
      }}
      redirectUrl="/dashboard"
      signInUrl="/sign-in"
      afterSignUpUrl="/dashboard"
    />
  );
}