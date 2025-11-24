import Link from "next/link"

const highlights = [
  {
    title: "Grounded presence",
    body: "Every interaction begins with a breath, inviting you to slow down before solving what matters.",
  },
  {
    title: "Expert calibration",
    body: "Built for high-functioning humans who still need compassion, nuance, and sharp insight.",
  },
  {
    title: "Always-on lifeline",
    body: "Enter anytime to steady your nervous system, clarify priorities, and move forward with care.",
  },
]

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#F7F4EF]">
      <div className="pointer-events-none absolute inset-x-10 top-16 h-64 rounded-full bg-[#EBD5D5]/40 blur-[120px]" />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Steady in the storm</p>
        <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Lifeline AI
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600 sm:text-xl">
          An emotionally intelligent anchor for high-functioning humans. Calm guidance, expert perspective, and
          compassionate accountability when the pressure builds.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/app"
            className="rounded-full bg-[#3D5C67] px-8 py-3 text-sm font-medium uppercase tracking-wide text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#2F444C]"
          >
            Enter Lifeline
          </Link>
          <Link
            href="/auth"
            className="rounded-full border border-[#3D5C67]/40 px-8 py-3 text-sm font-medium uppercase tracking-wide text-[#3D5C67] transition hover:bg-white/60"
          >
            Account access
          </Link>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#3D5C67]/70">{item.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/60 bg-white/70">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Why people stay</p>
            <p className="mt-2 text-base text-slate-700">
              "A calm, expert presence that helps me respond instead of react."
            </p>
          </div>
          <Link
            href="/app"
            className="text-sm font-semibold text-[#3D5C67] underline-offset-4 transition hover:text-[#2F444C] hover:underline"
          >
            Begin your session
          </Link>
        </div>
      </div>
    </main>
  )
}
