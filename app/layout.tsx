import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMO Agent — AI growth command center",
  description: "Plan, create, approve and measure startup marketing with coordinated AI agents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
