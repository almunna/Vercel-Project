import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupportChatbox } from "@/components/support-chatbox"
import { AuthProvider } from "@/lib/hooks/useAuth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moulai - #1 AI Tax Deduction Tracker",
  description: "Automatically track and categorize your tax deductions with AI-powered transaction analysis",
  keywords: ["tax deductions", "AI", "transaction analysis", "tax tracker", "financial management"],
  authors: [{ name: "Moulai Team" }],
  creator: "Moulai",
  publisher: "Moulai",
  robots: "index, follow",
  openGraph: {
    title: "Moulai - #1 AI Tax Deduction Tracker",
    description: "Automatically track and categorize your tax deductions with AI-powered transaction analysis",
    url: "https://moulai.com",
    siteName: "Moulai",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Moulai - #1 AI Tax Deduction Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moulai - #1 AI Tax Deduction Tracker",
    description: "Automatically track and categorize your tax deductions with AI-powered transaction analysis",
    images: ["/og-image.png"],
    creator: "@moulai",
  },
  icons: {
    icon: [
      { url: "favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "favicon/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#BEF397" }],
  },
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Explicit favicon links for better browser support */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#BEF397" />

        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Moulai" />
        <meta name="application-name" content="Moulai" />
        <meta name="msapplication-TileColor" content="#BEF397" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://api.stripe.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <SupportChatbox />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
