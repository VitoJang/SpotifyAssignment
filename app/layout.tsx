import "./globals.css";

export const metadata = {
  title: "Spotify Search",
  description: "Search Spotify's catalog for songs and albums",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
