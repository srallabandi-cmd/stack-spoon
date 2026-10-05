import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { WorkspaceProvider } from "@/lib/store";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stack Spoon: spoon-feed your work stack",
  description:
    "Invite Soft Launch: Role Pack, Approve Inbox, Slack read and Linear write after you approve. Other connectors stay Preview.",
  icons: {
    icon: "/brand/mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <WorkspaceProvider>{children}</WorkspaceProvider>
        <Analytics />
      </body>
    </html>
  );
}
