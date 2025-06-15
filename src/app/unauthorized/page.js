"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Unauthorized() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleGoToDashboard = () => {
    const userRole = session?.user?.role
    
    switch (userRole) {
      case 'admin':
        router.push('/admin/dashboard')
        break
      case 'manager':
        router.push('/manager/dashboard')
        break
      default:
        router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          {`You don't have permission to access this page. Please contact your administrator if you believe this is an error.`}
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleGoToDashboard}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Dashboard
          </button>
          
          <div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              ← Go Back
            </button>
          </div>
        </div>
        
        {session?.user && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Signed in as: <span className="font-medium">{session.user.email}</span>
              <br />
              Role: <span className="font-medium capitalize">{session.user.role}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}