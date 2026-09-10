'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, PlusSquare, Users, Settings } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    { name: 'Generate Docs', href: '/', icon: FileText },
    { name: 'Create Invoice', href: '/create-invoice', icon: PlusSquare },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Configuration', href: '/settings', icon: Settings },
  ]

  return (
    <div className="w-64 bg-white text-gray-800 border-r border-gray-200 flex flex-col h-screen select-none">
      <div className="p-5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-gray-900 leading-tight">
            Invoice and C Form Generator
          </h1>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
              <span>{link.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-100 text-xs text-gray-600 text-center">
        Invoice &amp; C Form System
      </div>
    </div>
  )
}
