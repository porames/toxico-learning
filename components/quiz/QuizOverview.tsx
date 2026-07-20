"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Pencil, Play, BarChart3, FileQuestion } from "lucide-react";
import type { Quiz } from "./types";

export default function QuizOverview({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/");
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "quizzes", quizId));
        if (!snap.exists()) {
          router.push("/quiz");
          return;
        }
        setQuiz({ id: snap.id, ...snap.data() } as Quiz);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quizId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-900/10 border-t-iris-600" />
      </div>
    );
  }

  if (!quiz) return null;

  const actions = [
    {
      label: "Edit quiz",
      description: "Add, remove, or modify questions and settings.",
      href: `/quiz/${quizId}/edit`,
      icon: Pencil,
      color: "iris",
    },
    {
      label: "Preview",
      description: "Take the quiz to see how it looks for students.",
      href: `/quiz/${quizId}/take`,
      icon: Play,
      color: "emerald",
    },
    {
      label: "Results",
      description: "View student submissions and scores.",
      href: `/quiz/${quizId}/results`,
      icon: BarChart3,
      color: "amber",
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; ring: string }> = {
    iris: { bg: "bg-iris-50", text: "text-iris-600", ring: "hover:border-iris-400 hover:bg-iris-50" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "hover:border-emerald-400 hover:bg-emerald-50" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "hover:border-amber-400 hover:bg-amber-50" },
  };

  return (
    <div className="mx-auto max-w-xl px-8 py-10">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-iris-50 text-iris-500">
          <FileQuestion className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-ink-900">{quiz.title || "Untitled quiz"}</p>
          <p className="text-[13px] text-ink-500">
            {quiz.questions?.length || 0} question{(quiz.questions?.length || 0) !== 1 ? "s" : ""} · Pass: {quiz.passingScore ?? 70}%{quiz.shuffleQuestions ? " · Shuffled" : ""}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {actions.map((action) => {
          const colors = colorClasses[action.color];
          const Icon = action.icon;
          return (
            <button
              key={action.href}
              onClick={() => router.push(action.href)}
              className={`flex w-full items-center gap-4 rounded-xl border border-ink-900/10 bg-white p-5 text-left shadow-soft transition ${colors.ring}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-ink-900">{action.label}</p>
                <p className="text-[12.5px] text-ink-500">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
