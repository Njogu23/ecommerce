"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function useRoleGuard(requiredRole = null, redirectPath = "/login") {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    // Not authenticated
    if (!session) {
      router.push(redirectPath)
      setIsLoading(false)
      return
    }

    // Check role-based access
    if (requiredRole) {
      const userRole = session.user?.role
      
      if (userRole !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        switch (userRole) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'manager':
            router.push('/manager/dashboard')
            break
          default:
            router.push('/unauthorized')
        }
        setIsLoading(false)
        return
      }
    }

    // Authorized
    setIsAuthorized(true)
    setIsLoading(false)
  }, [session, status, requiredRole, router, redirectPath])

  return { isAuthorized, isLoading, session }
}

// Utility functions for role checking
export function hasRole(session, role) {
  return session?.user?.role === role
}

export function hasAnyRole(session, roles) {
  return roles.includes(session?.user?.role)
}

export function isAdmin(session) {
  return hasRole(session, 'admin')
}

export function isManager(session) {
  return hasRole(session, 'manager')
}

export function canAccessAdmin(session) {
  return hasRole(session, 'admin')
}

export function canAccessManager(session) {
  return hasAnyRole(session, ['admin', 'manager'])
}