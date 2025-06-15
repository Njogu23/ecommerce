"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthGuard({ children, requiredRole = null, fallbackPath = "/login" }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    // Not authenticated
    if (!session) {
      router.push(fallbackPath)
      return
    }

    // Check role-based access
    if (requiredRole && session.user?.role !== requiredRole) {
      // Redirect based on user role
      if (session.user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (session.user?.role === 'manager') {
        router.push('/manager/dashboard')
      } else {
        router.push('/unauthorized')
      }
      return
    }
  }, [session, status, requiredRole, router, fallbackPath])

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return null // Will redirect via useEffect
  }

  // Role-based access denied
  if (requiredRole && session.user?.role !== requiredRole) {
    return null // Will redirect via useEffect
  }

  // Authorized - render children
  return children
}