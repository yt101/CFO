import Link from "next/link"

export default function AuthPage() {
  return (
    <section className="flex min-h-screen flex-col bg-[#F7F4EF] px-6 py-20 text-slate-900">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Account access</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Sign in to Lifeline</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Formal authentication flows are on the way. Until then, use this space as a placeholder and head into the app
          experience.
        </p>

        <div className="mt-8 space-y-4">
          <label className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">Email</label>
          <input
            type="email"
            disabled
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-slate-500 placeholder:text-slate-400"
          />
          <label className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">Password</label>
          <input
            type="password"
            disabled
            placeholder="********"
            className="w-full rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-slate-500 placeholder:text-slate-400"
          />
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-[#3D5C67]/40 bg-white/60 p-4 text-sm text-slate-600">
          Secure auth + Spaces support are in progress. Invite-only testers can continue from here.
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/app"
            className="rounded-full bg-[#3D5C67] px-8 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5"
          >
            Enter demo experience
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[#3D5C67] underline-offset-4 transition hover:underline"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  )
}
