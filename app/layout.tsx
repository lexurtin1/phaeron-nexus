import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Sidebar, DashboardHeader } from "@/components/layout/Sidebar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const openSans = Open_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Phaeron NEXUS · Internal Management System",
  description:
    "Phaeron NEXUS — internal management system for clients, fleet operations, revenue, and GraphRAG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={openSans.variable} suppressHydrationWarning>
      <body className={openSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <div className="min-h-screen bg-background text-foreground">
              <div className="relative z-10 flex min-h-screen">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                  <DashboardHeader />
                  <main className="flex-1 p-4 md:p-6">{children}</main>
                </div>
              </div>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
