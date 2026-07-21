"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Menu,
  LogOut,
  ChevronRight,
  Beaker,
  Play,
} from "lucide-react";
import UserInfoCard from "@/components/UserInfoCard";
import NavigationList from "../NavigationList";

interface SimCase {
  id: string;
  title: string;
}

export default function SimulatorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile: userProfile } = useUserProfile();
  const [showMenu, setShowMenu] = useState(false);
  const [cases, setCases] = useState<SimCase[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const snapshot = await getDocs(collection(db, "simulations"));
        setCases(snapshot.docs.map((d) => ({ id: d.id, title: d.data().title })) as SimCase[]);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const caseId = segments[1] && segments[1] !== "new" ? segments[1] : null;
  const isPlay = segments[2] === "play";
  const isNew = segments[1] === "new";
  const currentCase = caseId ? cases.find((c) => c.id === caseId) : null;

  const breadcrumbs: { label: string; href: string | null }[] = [];

  if (segments.length === 1) {
    breadcrumbs.push({ label: "All cases", href: null });
  } else {
    breadcrumbs.push({ label: "All cases", href: "/simulator" });

    if (isNew) {
      breadcrumbs.push({ label: "New case", href: null });
    } else if (currentCase) {
      breadcrumbs.push({
        label: currentCase.title || "Untitled",
        href: isPlay ? `/simulator/${caseId}` : null,
      });
      if (isPlay) {
        breadcrumbs.push({ label: "Play", href: null });
      }
    }
  }

  function isActive(href: string) {
    if (href === "/simulator") return pathname.startsWith("/simulator");
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink-900/8 bg-white px-5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center justify-center -ml-1 mr-1"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 text-ink-700" />
          </button>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-iris-600">
            <Beaker className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-1 min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-300" />}
                {crumb.href ? (
                  <button
                    onClick={() => {
                      router.push(crumb.href!);
                      setShowMenu(false);
                    }}
                    className="shrink truncate text-sm text-ink-900/60 hover:text-iris-600 transition-colors max-w-[120px]"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="shrink truncate text-sm font-semibold text-ink-900 max-w-[120px]">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {caseId && !isPlay && !isNew && (
          <button
            onClick={() => router.push(`/simulator/play/${caseId}`)}
            className="flex items-center gap-1.5 rounded-md bg-iris-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-iris-700 transition-colors"
          >
            <Play size={14} />
            Play
          </button>
        )}
      </header>

      <div className="relative flex min-h-0 flex-1">
        {showMenu && (
          <div
            className="fixed inset-0 z-10 bg-black/30"
            onClick={() => setShowMenu(false)}
          />
        )}

        <aside
          className={[
            "w-[300px] flex-col border-r border-ink-900/8 bg-white",
            showMenu ? "flex" : "hidden",
            showMenu && "fixed inset-y-0 left-0 z-20",
          ].filter(Boolean).join(" ")}
        >
          <div className="flex-1 overflow-y-auto px-2 pt-3">
            {userProfile && (
              <UserInfoCard
                name={userProfile.name}
                email={userProfile.email}
                photoURL={userProfile.photoURL}
                role={userProfile.role}
              />
            )}
            <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-300">Navigation</p>
            <NavigationList isAdmin={userProfile?.role === "admin" || userProfile?.role === "teacher"} />
          </div>

          <div className="border-t border-ink-900/8 px-2 py-2">
            <button
              type="button"
              onClick={() => signOut(auth).then(() => router.push("/"))}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
