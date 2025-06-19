// middleware.js
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    console.log("Middleware running for:", req.nextUrl.pathname)
    console.log("User role:", req.nextauth.token?.role)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Always allow access to auth pages and public assets
        if (pathname.startsWith('/login') || 
            pathname.startsWith('/register') ||
            pathname.startsWith('/api/auth') ||
            pathname.startsWith('/_next') ||
            pathname.includes('/favicon.ico')) {
          return true
        }
        
        // Require authentication for all other pages
        if (!token) {
          console.log("No token found, redirecting to login")
          return false
        }
        
        // Role-based access control
        const userRole = token.role
        console.log("User role from token:", userRole)
        
        // Home page and admin routes - only admin users
        if (pathname === '/' || pathname.startsWith('/admin')) {
          return userRole === 'ADMIN' || userRole === 'admin'
        }
        
        // Manager routes - admin and manager users
        if (pathname.startsWith('/manager')) {
          return userRole === 'ADMIN' || userRole === 'admin' || 
                 userRole === 'MANAGER' || userRole === 'manager'
        }
        
        // Default: allow access for authenticated users
        return true
      },
    },
    pages: {
      signIn: '/login', // Redirect unauthenticated users to login page
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ]
}