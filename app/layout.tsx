import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { TopNav } from "@/components/navigation/TopNav";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Phaeron NEXUS",
  description:
    "Phaeron NEXUS — internal command centre for the global intelligence network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={instrumentSerif.variable}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="nexus-shell">
          <div className="nexus-atmosphere" aria-hidden />
          <div className="nexus-content">
            <TopNav />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
