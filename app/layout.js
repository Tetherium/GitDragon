import { Press_Start_2P, Inter } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  variable: "--font-retro",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dragon - GitHub Tamagotchi",
  description: "A retro pixel art Tamagotchi dragon that evolves or dies based on your GitHub commit streaks!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${pressStart.variable} ${inter.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
