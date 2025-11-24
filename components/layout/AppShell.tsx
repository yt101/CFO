import type { ReactNode } from "react"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#F7F4EF] text-slate-900">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/70 bg-[#F7F4EF]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-slate-500">Lifeline</p>
            <p className="text-lg font-semibold text-slate-900">Lifeline AI</p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 shadow-inner">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Breathing</span>
            <span className="inline-flex h-3 w-3 rounded-full bg-[#EBD5D5] shadow shadow-[#EBD5D5]/70 animate-lifeline-pulse" />
          </div>
        </div>
      </header>
      <main className="px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default AppShell
