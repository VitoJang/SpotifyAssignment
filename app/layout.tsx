import "./globals.css";
import { Geist, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "Spotify Search",
  description: "Search Spotify's catalog for songs and albums",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, spaceGrotesk.variable)}>
      <body>{children}</body>
    </html>
  );
}
