export default function MeshPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-ink-900 lg:flex lg:w-[46%] xl:w-[42%]">
      {/* Gradient mesh — the signature element */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-90" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-900/40" />

      {/* Floating blobs for depth */}
      <div className="absolute -left-16 top-1/4 h-56 w-56 animate-float-slow rounded-full bg-mesh-teal/30 blur-3xl" />
      <div className="absolute right-0 top-10 h-64 w-64 animate-float rounded-full bg-mesh-pink/20 blur-3xl" />

      <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 shadow-lg">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
              <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" fill="#6842E0" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">Lumen</span>
        </div>

        <div className="max-w-sm">
          <p className="text-[13px] font-medium uppercase tracking-wider text-white/60">
            Welcome back
          </p>
          <h1 className="mt-3 text-[32px] font-semibold leading-[1.15] tracking-tight text-white">
            Everything you built,
            <br />
            right where you left it.
          </h1>

          {/* Floating glass card — signature detail, echoes a real product surface */}
          <div className="mt-10 animate-float-delayed rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-mesh-teal to-iris-500" />
                <div>
                  <div className="h-2 w-20 rounded-full bg-white/70" />
                  <div className="mt-1.5 h-2 w-12 rounded-full bg-white/35" />
                </div>
              </div>
              <span className="rounded-full bg-mesh-teal/20 px-2 py-1 text-[10px] font-medium text-mesh-teal">
                Synced
              </span>
            </div>
          </div>
        </div>

        <p className="text-[13px] text-white/45">© {new Date().getFullYear()} Lumen, Inc.</p>
      </div>
    </div>
  );
}
