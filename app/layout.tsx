import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Inter, Roboto } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"

import { AppearanceProvider } from "@/components/appearance/appearance-provider"
import { MotionProvider } from "@/components/motion/motion-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { appearanceInitScript } from "@/lib/appearance/init-script"
import { appBrand } from "@/config/navigation"

import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Omniverse",
  description: "Enterprise resource planning dashboard",
  icons: {
    icon: appBrand.logo,
    apple: appBrand.logo,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        GeistSans.variable,
        GeistMono.variable,
        inter.variable,
        roboto.variable
      )}
    >
      <body
        className="flex min-h-full flex-col font-sans"
        suppressHydrationWarning
      >
        <Script
          id="appearance-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: appearanceInitScript }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppearanceProvider>
            <MotionProvider>
              {children}
              <Toaster position="bottom-center" />
            </MotionProvider>
          </AppearanceProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
