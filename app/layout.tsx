import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { AuthProvider } from "@/providers/auth-provider"
import { ConditionalLayout } from "@/components/layout/conditional-layout"
import { RouteGuard } from "@/components/auth/route-guard"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
})
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: 'swap'
})

export const metadata: Metadata = {
  title: "MediOca - Advanced Healthcare Management Platform",
  description:
    "MediOca: AI-powered medical management with advanced analytics, predictive diagnostics, and professional healthcare solutions",
  generator: 'MediOca Healthcare Platform',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '16x16',
        type: 'image/x-icon',
      },
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
    other: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        sizes: '16x16',
        url: '/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        sizes: '32x32',
        url: '/favicon.ico',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Disable scroll restoration and scroll to top on page load
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              window.addEventListener('beforeunload', function() {
                window.scrollTo(0, 0);
              });
            `,
          }}        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <Providers>
            <RouteGuard>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </RouteGuard>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
