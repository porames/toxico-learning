import MeshPanel from "@/components/MeshPanel";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-canvas">
      <MeshPanel />

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10">
        {/* Logo shown only on small screens, where the mesh panel is hidden */}
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-iris-600 shadow-lg">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
              <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" fill="white" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-ink-900">Lumen</span>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
