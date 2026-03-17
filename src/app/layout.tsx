import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { SolanaWalletProvider } from "@/components/ui/solana-wallet-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { NextAuthProvider } from "@/components/next-auth-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shitter - Social for Crypto Degens",
  description: "The gold standard in social media for crypto degens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <NextAuthProvider>
            <SolanaWalletProvider>
              <ToastProvider>
                <ErrorBoundary>
                  <div className="flex min-h-screen bg-shit-darker">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 container mx-auto max-w-3xl p-4">
                        {children}
                      </main>
                    </div>
                  </div>
                </ErrorBoundary>
              </ToastProvider>
            </SolanaWalletProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
