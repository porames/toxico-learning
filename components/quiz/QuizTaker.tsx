"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Play, CheckCircle, XCircle } from "lucide-react";
import type { Quiz, Question, QuizAttempt } from "./types";
import { gradeQuiz } from "@/lib/quiz";
import moment from "moment";

export default function QuizTaker({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.uid);
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "quizzes", quizId));
        if (!snap.exists()) { router.push("/quiz"); return; }
        setQuiz({ id: snap.id, ...snap.data() } as Quiz);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quizId, router]);

  useEffect(() => {
    if (!userId) return;
    async function loadAttempts() {
      try {
        const q = query(
          collection(db, "users", userId as string, "quizAttempts"),
          where("quizId", "==", quizId)
        );
        const snap = await getDocs(q);
        setPreviousAttempts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizAttempt))
        );
      } catch (err) {
        console.error(err);
      }
    }
    loadAttempts();
  }, [userId, quizId]);

  const questions = useMemo(() => {
    if (!quiz) return [];
    const qs = [...quiz.questions];
    if (quiz.shuffleQuestions) {
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }
    }
    return qs;
  }, [quiz]);

  function setAnswer(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit() {
    if (!quiz || !userId) return;
    setSubmitting(true);
    try {
      const { score, totalPoints, passed, graded } = gradeQuiz(quiz.questions, answers);
      const attemptRef = await addDoc(collection(db, "users", userId, "quizAttempts"), {
        quizId,
        userId,
        score,
        totalPoints,
        passed,
        answers: graded.map((g) => ({
          questionId: g.questionId,
          answer: answers[g.questionId] || "",
          correct: g.correct,
        })),
        completedAt: serverTimestamp(),
      });
      router.push(`/quiz/${quizId}/results/${attemptRef.id}`);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-900/10 border-t-iris-600" />
      </div>
    );
  }

  if (!quiz) return null;

  if (!started) {
    return (
      <StartPage
        quiz={quiz}
        previousAttempts={previousAttempts}
        onStart={() => setStarted(true)}
      />
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;
  const allAnswered = answeredCount >= totalQuestions;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{quiz.title}</h1>
          <p className="mt-1 text-[14px] text-ink-500">
            {answeredCount} of {totalQuestions} answered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 rounded-full bg-ink-900/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-iris-500 transition-all"
              style={{ width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {questions.map((q, i) => (
          <QuestionBlock
            key={q.id}
            question={q}
            index={i}
            answer={answers[q.id]}
            onAnswer={(val) => setAnswer(q.id, val)}
          />
        ))}
      </div>

      <div className="mt-10 border-t border-ink-900/10 pt-6">
        <button
          onClick={handleSubmit}
          disabled={submitting || !allAnswered}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Submitting…
            </>
          ) : allAnswered ? (
            "Submit quiz"
          ) : (
            `Answer all questions to submit (${answeredCount}/${totalQuestions})`
          )}
        </button>
      </div>
    </div>
  );
}

function StartPage({
  quiz,
  previousAttempts,
  onStart,
}: {
  quiz: Quiz;
  previousAttempts: QuizAttempt[];
  onStart: () => void;
}) {
  const latestAttempt = previousAttempts.length > 0
    ? previousAttempts.reduce((a, b) => {
        const aTime = a.completedAt?.toDate?.()?.getTime() ?? 0;
        const bTime = b.completedAt?.toDate?.()?.getTime() ?? 0;
        return aTime > bTime ? a : b;
      })
    : null;

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <div className="rounded-xl border border-ink-900/10 bg-white p-8 shadow-soft">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink-900">{quiz.title}</h1>
          <p className="mt-1 text-[14px] text-ink-500">
            {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-ink-900/10 bg-ink-900/[0.02] px-4 py-3 text-center">
            <p className="text-[24px] font-bold text-ink-900">{quiz.questions.length}</p>
            <p className="text-[12px] text-ink-500">Questions</p>
          </div>
          <div className="rounded-lg border border-ink-900/10 bg-ink-900/[0.02] px-4 py-3 text-center">
            <p className="text-[24px] font-bold text-emerald-600">{quiz.passingScore ?? 70}%</p>
            <p className="text-[12px] text-ink-500">Passing score</p>
          </div>
        </div>

        {previousAttempts.length > 0 && (
          <div className="mt-6">
            <p className="text-[13px] font-semibold text-ink-900 mb-2">
              Previous attempts ({previousAttempts.length})
            </p>
            <div className="space-y-1.5">
              {[...previousAttempts]
                .sort((a, b) => {
                  const aTime = a.completedAt?.toDate?.()?.getTime() ?? 0;
                  const bTime = b.completedAt?.toDate?.()?.getTime() ?? 0;
                  return bTime - aTime;
                })
                .slice(0, 5)
                .map((attempt) => {
                  const pct = attempt.totalPoints > 0
                    ? Math.round((attempt.score / attempt.totalPoints) * 100)
                    : 0;
                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center gap-3 rounded-lg border border-ink-900/10 px-4 py-2.5"
                    >
                      {attempt.passed ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-ink-900">
                          {attempt.score} / {attempt.totalPoints} ({pct}%)
                        </p>
                      </div>
                      {attempt.completedAt && (
                        <p className="shrink-0 text-[11px] text-ink-400">
                          {moment(attempt.completedAt.toDate()).format("MMM D, YYYY")}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <button
          onClick={onStart}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 px-4 py-3 text-[15px] font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800"
        >
          <Play className="h-5 w-5" />
          {latestAttempt ? "Retake quiz" : "Start quiz"}
        </button>
      </div>
    </div>
  );
}

function QuestionBlock({
  question,
  index,
  answer,
  onAnswer,
}: {
  question: Question;
  index: number;
  answer: string | string[] | undefined;
  onAnswer: (val: string | string[]) => void;
}) {
  return (
    <div className="rounded-xl border border-ink-900/10 bg-white p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-iris-50 text-[13px] font-semibold text-iris-600">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-ink-900">{question.prompt}</p>
          <p className="mt-3 text-[12.5px] font-medium text-ink-400 uppercase tracking-wider">
            {question.points} pt{question.points !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {question.type === "multiple-choice" &&
          question.options.map((opt) => (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-[14px] transition ${
                answer === opt.id
                  ? "border-iris-400 bg-iris-50 text-iris-700"
                  : "border-ink-900/10 text-ink-700 hover:border-ink-900/20"
              }`}
            >
              <input
                type="radio"
                name={`q-${index}-${question.id}`}
                value={opt.id}
                checked={answer === opt.id}
                onChange={() => onAnswer(opt.id)}
                className="h-4 w-4 shrink-0 accent-iris-500"
              />
              {opt.value}
            </label>
          ))}

        {question.type === "multiple-answer" &&
          question.options.map((opt) => {
            const checked = Array.isArray(answer) && answer.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-[14px] transition ${
                  checked
                    ? "border-iris-400 bg-iris-50 text-iris-700"
                    : "border-ink-900/10 text-ink-700 hover:border-ink-900/20"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const arr = Array.isArray(answer) ? [...answer] : [];
                    if (e.target.checked) {
                      onAnswer([...arr, opt.id]);
                    } else {
                      onAnswer(arr.filter((a) => a !== opt.id));
                    }
                  }}
                  className="h-4 w-4 shrink-0 accent-iris-500"
                />
                {opt.value}
              </label>
            );
          })}

        {question.type === "true-false" && (
          <div className="flex gap-3">
            {question.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3 text-[14px] font-medium transition ${
                  answer === opt.id
                    ? "border-iris-400 bg-iris-50 text-iris-700"
                    : "border-ink-900/10 text-ink-600 hover:border-ink-900/20"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${index}-${question.id}`}
                  value={opt.id}
                  checked={answer === opt.id}
                  onChange={() => onAnswer(opt.id)}
                  className="hidden"
                />
                {opt.value}
              </label>
            ))}
          </div>
        )}

        {question.type === "short-answer" && (
          <input
            value={(answer as string) || ""}
            onChange={(e) => onAnswer(e.target.value)}
            className="w-full rounded-md bg-white px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-300 outline-1 -outline-offset-1 outline-ink-900/15 focus:outline-2 focus:-outline-offset-2 focus:outline-iris-500 transition"
            placeholder="Type your answer…"
          />
        )}
      </div>
    </div>
  );
}
