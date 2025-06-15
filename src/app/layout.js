import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "./components/SessionProvider";
import AuthLayout from "./components/AuthLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Admin Dashboard",
  description: "Modern admin dashboard for inventory and user management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gray-50 font-sans`}
      >
        <AuthSessionProvider>
          <AuthLayout>{children}</AuthLayout>
        </AuthSessionProvider>
      </body>
    </html>
  );
}