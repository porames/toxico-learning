"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Menu,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  Beaker,
  ClipboardList,
} from "lucide-react";
import UserInfoCard from "@/components/UserInfoCard";
import NavigationList from "../NavigationList";
import type { Quiz } from "./types";


export default function QuizShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile: userProfile } = useUserProfile();
  const [showMenu, setShowMenu] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const snapshot = await getDocs(collection(db, "quizzes"));
        setQuizzes(snapshot.docs.map((d) => ({ id: d.id, title: d.data().title })) as Quiz[]);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const quizId = segments[1] && segments[1] !== "new" ? segments[1] : null;
  const currentQuiz = quizId ? quizzes.find((q) => q.id === quizId) : null;

  const breadcrumbs: { label: string; href: string | null }[] = [];

  if (segments.length === 1) {
    breadcrumbs.push({ label: "All quizzes", href: null });
  } else {
    breadcrumbs.push({ label: "All quizzes", href: "/quiz" });

    if (segments[1] === "new") {
      breadcrumbs.push({ label: "New quiz", href: null });
    } else if (currentQuiz) {
      breadcrumbs.push({
        label: currentQuiz.title || "Untitled",
        href: segments.length > 2 ? `/quiz/${quizId}` : null,
      });
      if (segments[2] === "edit") {
        breadcrumbs.push({ label: "Edit", href: null });
      } else if (segments[2] === "take") {
        breadcrumbs.push({ label: "Take", href: null });
      } else if (segments[2] === "results") {
        breadcrumbs.push({ label: "Results", href: null });
      }
    }
  }

  function isActive(href: string) {
    if (href === "/quiz") return pathname.startsWith("/quiz");
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink-900/8 bg-white px-5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden flex items-center justify-center -ml-1 mr-1"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 text-ink-700" />
          </button>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-iris-600">
            <ClipboardList className="h-4 w-4 text-white" />
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
      </header>

      <div className="relative flex min-h-0 flex-1">
        {showMenu && (
          <div
            className="fixed inset-0 z-10 bg-black/30 md:hidden"
            onClick={() => setShowMenu(false)}
          />
        )}

        <aside
          className={`flex w-[300px] shrink-0 flex-col border-r border-ink-900/8 bg-white md:relative md:z-auto md:flex ${showMenu ? "fixed inset-y-0 left-0 z-20 block" : "hidden"
            }`}
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
