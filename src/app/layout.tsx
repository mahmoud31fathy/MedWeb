import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";
import FloatingMedicalIcons from "../components/FloatingMedicalIcons";
import MedicalPulseBackground from "../components/MedicalPulseBackground";
import CursorGlow from "../components/CursorGlow";

export const metadata: Metadata = {
  title: "MedWeb Summit 2026",
  description: "The premier conference for healthcare innovation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CursorGlow />
        <MedicalPulseBackground />
        <FloatingMedicalIcons />
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
