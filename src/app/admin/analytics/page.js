// app/admin/analytics/page.js
import AnalyticsDashboard from "@/app/components/admin/AnalyticsDashboard";
import AuthGuard from "@/app/components/AuthGuard";

export default function AnalyticsPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
    <div className="bg-gray-50 min-h-screen">
      <AnalyticsDashboard />
    </div>
    </AuthGuard>
  );
}