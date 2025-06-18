import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Providers } from "@/components/providers"
import { BackgroundEffects } from "@/components/ui/background-effects"
import { ScrollToTop } from "@/components/ui/scroll-to-top"

const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "MedAI Pro - Revolutionary Healthcare Platform",
  description:
    "AI-powered medical management with advanced analytics, predictive diagnostics, and professional healthcare solutions",
  generator: 'v0.dev',
  icons: {
    icon: [
      {
        url: '/placeholder-logo.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/placeholder-logo.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: '/placeholder-logo.png',
    apple: '/placeholder-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.className} ${poppins.variable} scroll-smooth`}>
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
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            <BackgroundEffects />
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative z-10 ml-64"> {/* Added ml-64 to account for fixed sidebar */}
              <div className="sticky top-0 w-full z-50 px-2">
                <Header /> {/* Removed margin-left to make header full width */}
              </div>
              <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pt-32 scroll-smooth" id="main-content"> {/* Removed left padding */}
                <div className="max-w-7xl mx-auto animate-fade-in-up mt-4">{children}</div>
              </main>
            </div>
          </div>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}
