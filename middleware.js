import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
    console.log("Middleware running for:", req.nextUrl.pathname)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Always allow access to auth pages
        if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
          return true
        }
        
        // Require authentication for all other pages
        if (!token) {
          return false
        }
        
        // Role-based access control
        const userRole = token.role
        
        // Admin routes - only admin users
        if (pathname.startsWith('/admin')) {
          return userRole === 'admin'
        }
        
        // Manager routes - admin and manager users
        if (pathname.startsWith('/manager')) {
          return userRole === 'admin' || userRole === 'manager'
        }
        
        // Default: allow access for authenticated users
        return true
      },
    },
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
     * - public (public files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ]
}