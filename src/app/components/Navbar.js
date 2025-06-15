"use client"
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isMobileNavbarOpen, setIsMobileNavbarOpen] = useState(false);

    // Don't render Navbar if not authenticated or still loading
    if (status === "loading" || !session) {
        return null;
    }

    const navItems = [
        {
            name: "Analytics",
            href: "/admin/analytics",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            name: "Inventory",
            href: "/admin/inventory",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        },
        {
            name: "Add Product",
            href: "/admin/products/new",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            )
        },
        {
            name: "Users",
            href: "/admin/users",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            )
        },
        {
            name: "Customers",
            href: "/admin/customers",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        }
    ];

    const isActive = (href) => pathname === href;

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileNavbarOpen(!isMobileNavbarOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 bg-white hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 shadow-md border border-gray-200"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileNavbarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Navbar overlay */}
            {isMobileNavbarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileNavbarOpen(false)} />
            )}

            {/* Navbar */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                isMobileNavbarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Logo/Brand */}
                    <div className="flex items-center h-16 px-6 border-b border-gray-200 flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="ml-3 text-xl font-bold text-gray-900">Admin</span>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        <nav className="flex-1 px-4 py-6 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileNavbarOpen(false)}
                                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                        isActive(item.href)
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`mr-3 flex-shrink-0 ${
                                        isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                    }`}>
                                        {item.icon}
                                    </div>
                                    <span className="flex-1">{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Logout Button */}
                        <div className="flex-shrink-0 p-4 border-t border-gray-200">
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                            >
                                <svg className="w-5 h-5 mr-3 text-red-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="flex-1 text-left">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}