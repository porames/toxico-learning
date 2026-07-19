"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ClipboardList, Plus, Pencil, Trash2, FileQuestion, LogOut } from "lucide-react";
import type { Quiz } from "./types";
import moment from "moment";

interface UserProfile {
  name: string;
  email: string;
  photoURL: string | null;
}

export default function QuizList() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }
      try {
        const q = query(collection(db, "users"), where("authId", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setUserProfile({
            name: data.name ?? user.displayName ?? "User",
            email: data.email ?? user.email ?? "",
            photoURL: user.photoURL,
          });
        }
      } catch (err) {
        console.error(err);
      }
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
    <div className="mx-auto max-w-5xl px-6 py-10">
      {userProfile && (
        <div className="mb-8 flex items-center justify-between rounded-xl border border-ink-900/10 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            {userProfile.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-iris-100 text-[15px] font-semibold text-iris-600">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[14px] font-semibold text-ink-900">{userProfile.name}</p>
              <p className="text-[12.5px] text-ink-500">{userProfile.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth).then(() => router.push("/"))}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-ink-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Quizzes</h1>
          <p className="mt-1 text-[14px] text-ink-500">
            {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} created
          </p>
        </div>
        <button
          onClick={() => router.push("/quiz/new")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 px-4 py-2.5 text-[14px] font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800"
        >
          <Plus className="h-4 w-4" />
          Create quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-iris-50 text-iris-500">
            <ClipboardList className="h-8 w-8" />
          </div>
          <p className="mt-5 text-[16px] font-medium text-ink-900">No quizzes yet</p>
          <p className="mt-1 max-w-sm text-[14px] text-ink-500">
            Create your first quiz to start building questions for your students.
          </p>
          <button
            onClick={() => router.push("/quiz/new")}
            className="mt-6 flex items-center gap-2 rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 px-4 py-2.5 text-[14px] font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800"
          >
            <Plus className="h-4 w-4" />
            Create quiz
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-xl border border-ink-900/10 bg-white p-5 shadow-soft transition hover:border-iris-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-4 w-4 shrink-0 text-iris-500" />
                    <h3
                      className="cursor-pointer truncate text-[15px] font-semibold text-ink-900 hover:text-iris-600"
                      onClick={() => router.push(`/quiz/${quiz.id}`)}
                    >
                      {quiz.title || "Untitled quiz"}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-[13px] text-ink-500">
                    {quiz.questions?.length || 0} question{(quiz.questions?.length || 0) !== 1 ? "s" : ""} · Pass: {quiz.passingScore ?? 70}%
                  </p>
                  {quiz.createdAt && (
                    <p className="mt-0.5 text-[12px] text-ink-300">
                      Created {moment(quiz.createdAt.toDate()).fromNow()}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => router.push(`/quiz/${quiz.id}`)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-iris-50 hover:text-iris-600"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-red-50 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
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
