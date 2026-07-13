'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, LayoutDashboard, PlusCircle, LogOut, User, Moon, Bell, ChevronDown } from 'lucide-react'
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
  const pathname = usePathname()

  const renderBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length === 0) {
      return (
        <span className="text-sm font-semibold text-slate-100">Dashboard</span>
      )
    }

    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
        {parts.map((part, idx) => {
          if (part === 'offers') return null
          if (part === 'new') {
            return (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="text-slate-600">/</span>
                <span className="text-slate-200 font-semibold">Nova Oferta</span>
              </span>
            )
          }
          if (part === 'edit') {
            return (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="text-slate-600">/</span>
                <span className="text-slate-200 font-semibold">Editar Oferta</span>
              </span>
            )
          }
          // Details page
          if (idx === 1) {
            return (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="text-slate-600">/</span>
                <span className="text-slate-200 font-semibold">Detalhes</span>
              </span>
            )
          }
          return null
        })}
      </div>
    )
  }
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
        <header className="h-16 border-b border-slate-900/60 bg-slate-950/20 backdrop-blur-md shrink-0 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto w-full h-full px-6 md:px-8 flex items-center justify-between">
            {/* Left: Breadcrumbs / Title */}
            <div className="flex items-center gap-4">
              {/* Mobile Logo */}
              <div className="flex items-center gap-2 md:hidden">
                <div className="p-1 bg-primary/10 text-primary border border-primary/20 rounded text-white shrink-0">
                  <BarChart2 className="w-4 h-4" />
                </div>
              </div>
              {renderBreadcrumbs()}
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button 
                title="Alternar Tema" 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-900/60 rounded-xl transition-all cursor-pointer hidden sm:flex items-center justify-center"
              >
                <Moon className="w-4.5 h-4.5" />
              </button>

              {/* Notifications Button */}
              <button 
                title="Notificações" 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-900/60 rounded-xl transition-all cursor-pointer relative flex items-center justify-center"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 ring-1 ring-slate-950 animate-pulse" />
              </button>

              {/* Separator */}
              <div className="h-5 w-px bg-slate-900/80 mx-1 hidden sm:block" />

              {/* User Dropdown Profile */}
              <div className="flex items-center gap-2 pl-1 cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0 uppercase shadow-[0_0_12px_rgba(99,102,241,0.05)]">
                  {userName.substring(0, 2)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors capitalize leading-none">{userName}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5 leading-none">Usuário</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-350 transition-colors hidden sm:block" />
              </div>

              {/* Mobile logout */}
              <form action={logout} className="md:hidden ml-1">
                <button
                  type="submit"
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
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
