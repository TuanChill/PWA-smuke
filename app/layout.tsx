import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/lib/auth/auth-context";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smuke.app",
  description: "Personal AI-curated news intelligence that learns from your swipes, comments, and goals.",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#315a4f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader
          color="#315a4f"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #315a4f,0 0 5px #315a4f"
          zIndex={1600}
        />
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
