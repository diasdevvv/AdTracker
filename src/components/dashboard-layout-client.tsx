'use client'

import Link from 'next/link'
import { BarChart2, LayoutDashboard, PlusCircle, LogOut, User } from 'lucide-react'
import { logout } from '@/app/(auth)/login/actions'

interface DashboardLayoutClientProps {
  userName: string
  userEmail: string
  children: React.ReactNode
}

export default function DashboardLayoutClient({
  userName,
  userEmail,
  children,
}: DashboardLayoutClientProps) {
  return (
    <div className="flex min-h-screen bg-background font-sans text-slate-100">
      {/* Sidebar - Desktop (Floating Vertical Pill, Icons Only) */}
      <aside className="hidden md:flex flex-col items-center justify-between py-6 my-4 ml-4 w-20 bg-gradient-to-b from-zinc-900/95 via-[#0d0d14]/95 to-[#161125]/95 border border-border rounded-[32px] shrink-0 shadow-lg sticky top-4 h-[calc(100vh-2rem)]">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Top: Logo */}
          <div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-2xl">
            <BarChart2 className="w-5 h-5 animate-pulse" />
          </div>

          {/* Navigation Icons Only - Right below Logo */}
          <nav className="flex flex-col items-center gap-4 w-full px-2">
            <Link
              href="/"
              title="Dashboard"
              className="p-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-primary/15 hover:text-primary transition-all flex items-center justify-center"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <Link
              href="/offers/new"
              title="Nova Oferta"
              className="p-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-primary/15 hover:text-primary transition-all flex items-center justify-center"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
          </nav>
        </div>

        {/* Bottom: Logout */}
        <div className="flex flex-col items-center w-full px-2">
          <form action={logout}>
            <button
              type="submit"
              title="Sair"
              className="p-3.5 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all cursor-pointer flex items-center justify-center"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-transparent shrink-0">
          <div className="max-w-7xl mx-auto w-full h-full px-6 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Logo / Title */}
              <div className="flex items-center gap-2 md:hidden">
                <div className="p-1 bg-primary/10 text-primary border border-primary/20 rounded text-white">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-white">
                  <Link href="/">AdTracker</Link>
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-slate-200 capitalize">{userName}</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{userEmail}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              </div>

              {/* Mobile logout */}
              <form action={logout} className="md:hidden">
                <button
                  type="submit"
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-md transition-colors cursor-pointer"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
