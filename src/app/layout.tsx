import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "CRUD + RBAC Platform",
  description: "A comprehensive low-code platform for defining data models and generating CRUD APIs with role-based access control",
  keywords: ["CRUD", "RBAC", "Next.js", "TypeScript", "Tailwind CSS", "low-code", "API generation"],
  authors: [{ name: "CRUD + RBAC Platform" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "CRUD + RBAC Platform",
    description: "Low-code platform for data models and CRUD APIs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CRUD + RBAC Platform",
    description: "Low-code platform for data models and CRUD APIs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
