// app/page.js
import AnalyticsDashboard from "@/app/components/admin/AnalyticsDashboard";
import AuthGuard from "./components/AuthGuard";

export default function HomePage() {
  return (
    <AuthGuard requiredRole="ADMIN">
    <div className="bg-gray-50 min-h-screen">
      <AnalyticsDashboard />
    </div>
    </AuthGuard>
  );
} 