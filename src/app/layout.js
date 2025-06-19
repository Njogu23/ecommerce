import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "./components/SessionProvider";
import Navbar from "./components/Navbar";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gray-50 font-sans` } suppressHydrationWarning
      >
        <AuthSessionProvider>
          <div className="flex h-screen">
            <Navbar/>
            <main className="flex-1 overflow-y-auto">
              <div>{children}</div>
            </main>
          </div>
        </AuthSessionProvider>
        </body>
    </html>
  );
}