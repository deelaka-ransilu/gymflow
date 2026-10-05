import type { Metadata } from "next";
import { Poppins, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow",
});

const description =
  "Know in one second who can come in, who owes money, and who needs to renew. A simple gym management demo.";

export const metadata: Metadata = {
  title: "GymFlow - Run your gym from one simple screen",
  description,
  openGraph: {
    title: "GymFlow - Run your gym from one simple screen",
    description,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="dark" className={`${poppins.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}