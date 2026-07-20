"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ClipboardList, Plus, Pencil, Trash2, FileQuestion } from "lucide-react";
import type { Quiz } from "./types";
import moment from "moment";

export default function QuizList() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
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
        const snapshot = await getDocs(collection(db, "quizzes"));
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Quiz));
        setQuizzes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this quiz? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "quizzes", id));
      setQuizzes(quizzes.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-900/10 border-t-iris-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-8 py-10">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium uppercase tracking-wider text-ink-300">Quizzes</p>
        <button
          onClick={() => router.push("/quiz/new")}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800"
        >
          <Plus className="h-3.5 w-3.5" />
          New quiz
        </button>
      </div>

      <p className="mt-1 text-[13.5px] text-ink-500">
        {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} created
      </p>

      {quizzes.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-8 text-center mt-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-iris-50 text-iris-500">
            <ClipboardList className="h-6 w-6" />
          </div>
          <p className="mt-4 text-[15px] font-medium text-ink-900">No quizzes yet</p>
          <p className="mt-1 max-w-xs text-[13.5px] text-ink-500">
            Create your first quiz to start building questions for your students.
          </p>
          <button
            onClick={() => router.push("/quiz/new")}
            className="mt-5 flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 px-4 py-2 text-[13.5px] font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800"
          >
            <Plus className="h-3.5 w-3.5" />
            New quiz
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-lg border border-ink-900/10 bg-white px-4 py-3 transition hover:border-iris-300"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileQuestion className="h-4 w-4 shrink-0 text-iris-500" />
                  <div className="min-w-0 flex-1">
                    <p
                      className="cursor-pointer truncate text-[14px] font-medium text-ink-900 hover:text-iris-600"
                      onClick={() => router.push(`/quiz/${quiz.id}`)}
                    >
                      {quiz.title || "Untitled quiz"}
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-ink-400">
                      {quiz.questions?.length || 0} question{(quiz.questions?.length || 0) !== 1 ? "s" : ""} · Pass: {quiz.passingScore ?? 70}%
                      {quiz.createdAt && (
                        <> · Created {moment(quiz.createdAt.toDate()).fromNow()}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => router.push(`/quiz/${quiz.id}/edit`)}
                    className="flex h-7 w-7 items-center justify-center rounded text-ink-400 transition hover:bg-iris-50 hover:text-iris-600"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="flex h-7 w-7 items-center justify-center rounded text-ink-400 transition hover:bg-red-50 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
