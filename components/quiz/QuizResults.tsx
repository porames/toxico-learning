"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle, XCircle } from "lucide-react";
import type { Quiz, QuizAttempt, Question } from "./types";
import { getOptionLabel } from "./types";

export default function QuizResults({
  quizId,
  attemptId,
}: {
  quizId: string;
  attemptId: string;
}) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/"); return; }
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    async function load() {
      try {
        const { uid } = auth.currentUser!;
        const [quizSnap, attemptSnap] = await Promise.all([
          getDoc(doc(db, "quizzes", quizId)),
          getDoc(doc(db, "quizAttempts", attemptId)),
        ]);
        if (!quizSnap.exists() || !attemptSnap.exists()) {
          router.push("/quiz");
          return;
        }
        setQuiz({ id: quizSnap.id, ...quizSnap.data() } as Quiz);
        setAttempt({ id: attemptSnap.id, ...attemptSnap.data() } as QuizAttempt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quizId, attemptId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-900/10 border-t-iris-600" />
      </div>
    );
  }

  if (!quiz || !attempt) return null;

  const pct =
    attempt.totalPoints > 0
      ? Math.round((attempt.score / attempt.totalPoints) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-xl px-8 py-10">
      <p className="text-[12px] font-medium uppercase tracking-wider text-ink-300">Results</p>

      <div className="mt-4 rounded-xl border border-ink-900/10 bg-white p-8 shadow-soft">
        <div className="text-center">
          <p className="text-[15px] font-semibold text-ink-900">{quiz.title}</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <span
              className={`text-5xl font-bold ${attempt.passed ? "text-emerald-600" : "text-red-500"}`}
            >
              {pct}%
            </span>
            <div className="text-left">
              <p className="text-[14px] text-ink-500">
                {attempt.score} / {attempt.totalPoints} points
              </p>
              <span
                className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                  attempt.passed
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {attempt.passed ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {attempt.passed ? "Passed" : "Failed"}
              </span>
            </div>
          </div>
          <div className="mt-4 h-2.5 w-full max-w-sm mx-auto rounded-full bg-ink-900/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                attempt.passed ? "bg-emerald-500" : "bg-red-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-9 border-t border-ink-900/10 pt-6">
        <p className="text-[15px] font-semibold text-ink-900">
          Review
          <span className="ml-1.5 font-normal text-ink-300">
            ({quiz.questions.length} questions)
          </span>
        </p>

        <div className="mt-4 space-y-3">
          {quiz.questions.map((q, i) => (
            <ResultCard
              key={q.id}
              question={q}
              index={i}
              attemptAnswer={attempt.answers.find((a) => a.questionId === q.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  question,
  index,
  attemptAnswer,
}: {
  question: Question;
  index: number;
  attemptAnswer?: { questionId: string; answer: string | string[]; correct: boolean };
}) {
  const correct = attemptAnswer?.correct ?? false;

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-soft ${
        correct ? "border-emerald-200" : "border-red-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-semibold ${
            correct
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {correct ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-ink-900">{question.prompt}</p>
          <p className="mt-1 text-[12.5px] font-medium text-ink-400 uppercase tracking-wider">
            {question.points} pt{question.points !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 pl-10">
        <p className="text-[13px] text-ink-500">
          <span className="font-medium text-ink-700">Your answer:</span>{" "}
          {formatAnswerDisplay(attemptAnswer?.answer, question)}
        </p>
        {!correct && (
          <p className="text-[13px] text-ink-500">
            <span className="font-medium text-emerald-600">Correct answer:</span>{" "}
            {formatCorrectAnswerDisplay(question)}
          </p>
        )}
        {question.explanation && (
          <p className="mt-2 rounded-lg bg-ink-900/[0.03] px-3 py-2 text-[13px] text-ink-500">
            {question.explanation}
          </p>
        )}
      </div>
    </div>
  );
}

function formatAnswerDisplay(
  answer: string | string[] | undefined,
  question: Question
): string {
  if (!answer || (Array.isArray(answer) && answer.length === 0)) return "(no answer)";
  if (Array.isArray(answer)) {
    return answer
      .map((id) => getOptionLabel(question.options, id))
      .join(", ");
  }
  if (question.type === "short-answer") return answer;
  return getOptionLabel(question.options, answer);
}

function formatCorrectAnswerDisplay(question: Question): string {
  if (Array.isArray(question.correctAnswer)) {
    return question.correctAnswer
      .map((id) => getOptionLabel(question.options, id))
      .join(", ");
  }
  if (question.type === "short-answer") return question.correctAnswer;
  return getOptionLabel(question.options, question.correctAnswer);
}
