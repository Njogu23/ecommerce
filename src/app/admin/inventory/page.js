import InventoryDashboard from '@/app/components/admin/InventoryDashboard'
import AuthGuard from '@/app/components/AuthGuard';

const Page = () => {
  return (
    <AuthGuard requiredRole="ADMIN">
    <div>
        <InventoryDashboard />
    </div>
    </AuthGuard>
  )
}

export default Page;

