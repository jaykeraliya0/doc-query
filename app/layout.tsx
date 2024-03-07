import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Provider from "@/context/Provider";
import { cn, constructMetadata } from "@/lib/utils";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Provider>
        <body
          className={cn("min-h-screen font-sans antialiased", inter.className)}
        >
          <Toaster />
          <Navbar />
          {children}
          <Analytics />
        </body>
      </Provider>
    </html>
  );
}
