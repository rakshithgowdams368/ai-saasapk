// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { IndexedDBProvider } from "@/components/storage/indexdb-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "NexusAI - AI-Powered Content Generation Platform",
  description: "Create stunning images, videos, code, audio, and have intelligent conversations with advanced AI models.",
  title: "NexusAI - AI-Powered Content Generation Platform",
  description: "Create stunning images, videos, code, audio, and have intelligent conversations with advanced AI models.",
  keywords: ["AI", "Content Generation", "DALL-E", "Gemini", "ChatGPT", "NexusAI"],
  authors: [{ name: "NexusAI Team" }],
  creator: "NexusAI",
  publisher: "NexusAI",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexusai.com",
    siteName: "NexusAI",
    title: "NexusAI - AI-Powered Content Generation Platform",
    description: "Create stunning images, videos, code, audio, and have intelligent conversations with advanced AI models.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NexusAI Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexusAI - AI-Powered Content Generation Platform",
    description: "Create stunning images, videos, code, audio, and have intelligent conversations with advanced AI models.",
    images: ["/twitter-image.png"],
    creator: "@nexusai",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

// Fix: Move viewport and themeColor here
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className={`${inter.className} dark`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="nexusai-theme"
          >
            <IndexedDBProvider>
              {children}
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #374151',
                  },
                  className: 'sonner-toast',
                  duration: 5000,
                }}
              />
            </IndexedDBProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}