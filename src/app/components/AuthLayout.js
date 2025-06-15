"use client"
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";

export default function AuthLayout({ children }) {
  const { data: session, status } = useSession();

  // Show loading state
  if (status === "loading") {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show full-width layout
  if (!session) {
    return (
      <div className="h-full">
        <main className="h-full bg-gray-50">
          <div className="h-full p-4 sm:p-6 lg:p-8">
            <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 h-full">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If authenticated, show Navbar layout
  return (
    <div className="h-full flex">
      {/* Navbar */}
      <Navbar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:pl-0">
        <main className="flex-1 bg-gray-50 lg:ml-0">
          <div className="h-full p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
            <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 h-full">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}