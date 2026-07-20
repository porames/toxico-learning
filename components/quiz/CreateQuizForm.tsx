"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Plus } from "lucide-react";

const fieldClass =
  "w-full rounded-md bg-white px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-300 outline-1 -outline-offset-1 outline-ink-900/15 focus:outline-2 focus:-outline-offset-2 focus:outline-iris-500 transition";
const labelClass = "mb-1.5 block text-[12.5px] font-medium text-ink-700";

export default function CreateQuizForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [shuffle, setShuffle] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/");
    });
    return unsub;
  }, [router]);

  async function handleCreate() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "quizzes"), {
        title: title.trim(),
        questions: [],
        passingScore,
        shuffleQuestions: shuffle,
        createdAt: serverTimestamp(),
      });
      router.push(`/quiz/${docRef.id}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-8 py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink-500 hover:text-ink-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <p className="mt-6 text-[12px] font-medium uppercase tracking-wider text-ink-300">New quiz</p>

      <div className="mt-4 space-y-6">
        <div>
          <label className={labelClass}>Quiz title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
            placeholder="e.g. Cardiology Quiz 1"
            autoFocus
          />
        </div>

        <div>
          <label className={labelClass}>Passing score (%)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="flex-1 accent-iris-500"
            />
            <span className="w-10 text-right text-[14px] font-semibold text-ink-900">
              {passingScore}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="shuffle"
            checked={shuffle}
            onChange={(e) => setShuffle(e.target.checked)}
            className="h-4 w-4 rounded border-ink-900/20 text-iris-500 focus:ring-iris-500"
          />
          <label htmlFor="shuffle" className="text-[14px] text-ink-700">
            Shuffle questions for students
          </label>
        </div>

        <button
          onClick={handleCreate}
          disabled={saving || !title.trim()}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating…
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Create quiz
            </>
          )}
        </button>
      </div>
    </div>
  );
}
