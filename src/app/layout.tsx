import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Y10 CRM - Young10 Marketing",
  description:
    "Mini CRM & Sales Management platform for Young10 Marketing - leads, pipeline, tasks and analytics.",
  icons: {
    icon: "/brand/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#384BFE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
