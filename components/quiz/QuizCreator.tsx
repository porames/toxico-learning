"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import type { Option, Question, QuestionType, Quiz } from "./types";
import { QUESTION_TYPE_LABELS } from "./types";

const fieldClass =
  "w-full rounded-md bg-white px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-300 outline-1 -outline-offset-1 outline-ink-900/15 focus:outline-2 focus:-outline-offset-2 focus:outline-iris-500 transition";
const labelClass = "mb-1.5 block text-[12.5px] font-medium text-ink-700";

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `q-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createQuestion(type: QuestionType): Question {
  const base: Question = {
    id: makeId(),
    type,
    prompt: "",
    options: [],
    correctAnswer: "",
    explanation: "",
    points: 1,
  };
  if (type === "multiple-choice" || type === "multiple-answer") {
    base.options = [{ id: makeId(), value: "" }, { id: makeId(), value: "" }];
  }
  if (type === "true-false") {
    base.options = [
      { id: "tf-true", value: "True" },
      { id: "tf-false", value: "False" },
    ];
    base.correctAnswer = "tf-true";
  }
  return base;
}

export default function QuizCreator({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [shuffle, setShuffle] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

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
        const data = { id: snap.id, ...snap.data() } as Quiz;
        setTitle(data.title || "");
        setPassingScore(data.passingScore ?? 70);
        setShuffle(data.shuffleQuestions ?? false);
        setQuestions(data.questions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quizId, router]);

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function addQuestion() {
    const q = createQuestion("multiple-choice");
    setQuestions([...questions, q]);
    setExpandedQuestion(q.id);
  }

  function deleteQuestion(id: string) {
    setQuestions(questions.filter((q) => q.id !== id));
    if (expandedQuestion === id) setExpandedQuestion(null);
  }

  async function saveChanges() {
    setSaving(true);
    try {
      await updateDoc(doc(db, "quizzes", quizId), {
        title,
        passingScore,
        shuffleQuestions: shuffle,
        questions,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
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
      <p className="text-[12px] font-medium uppercase tracking-wider text-ink-300">Quiz</p>

      <div className="mt-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <label className={labelClass}>Quiz title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
              placeholder="e.g. Cardiology Quiz 1"
            />
          </div>
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label className={labelClass}>Passing score:</label>
            <input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className={`${fieldClass} w-20 text-center`}
            />
            <span className="text-[13px] text-ink-300">%</span>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-ink-500">
            <input
              type="checkbox"
              checked={shuffle}
              onChange={(e) => setShuffle(e.target.checked)}
              className="h-4 w-4 rounded border-ink-900/20 text-iris-500"
            />
            Shuffle questions
          </label>
        </div>
      </div>

      <div className="mt-9 border-t border-ink-900/10 pt-6">
        <p className="text-[15px] font-semibold text-ink-900">
          Questions
          <span className="ml-1.5 font-normal text-ink-300">({questions.length})</span>
        </p>

        <div className="mt-4 space-y-3">
          {questions.length === 0 && (
            <div className="rounded-xl border border-dashed border-ink-900/15 py-12 text-center">
              <p className="text-[14px] text-ink-400">No questions yet.</p>
              <p className="mt-0.5 text-[13px] text-ink-300">
                Click the button below to add your first question.
              </p>
            </div>
          )}

          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              expanded={expandedQuestion === q.id}
              onToggle={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
              onUpdate={(patch) => updateQuestion(q.id, patch)}
              onDelete={() => deleteQuestion(q.id)}
            />
          ))}

          <button
            onClick={addQuestion}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-900/15 bg-white px-3 py-2 text-[13px] font-medium text-ink-500 transition hover:border-iris-400 hover:text-iris-600"
          >
            <Plus className="h-3.5 w-3.5" />
            Add question
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  expanded,
  onToggle,
  onUpdate,
  onDelete,
}: {
  question: Question;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<Question>) => void;
  onDelete: () => void;
}) {
  function handleTypeChange(type: QuestionType) {
    let options: Option[] = [];
    let correctAnswer: string | string[] = "";
    if (type === "true-false") {
      options = [
        { id: "tf-true", value: "True" },
        { id: "tf-false", value: "False" },
      ];
      correctAnswer = "tf-true";
    } else if (type === "multiple-choice" || type === "multiple-answer") {
      options =
        question.options.length > 0
          ? question.options
          : [{ id: makeId(), value: "" }, { id: makeId(), value: "" }];
    }
    onUpdate({ type, options, correctAnswer });
  }

  function updateOption(i: number, value: string) {
    const opts = [...(question.options || [])];
    opts[i] = { ...opts[i], value };
    onUpdate({ options: opts });
  }

  function addOption() {
    onUpdate({ options: [...(question.options || []), { id: makeId(), value: "" }] });
  }

  function removeOption(i: number) {
    const opts = question.options.filter((_, idx) => idx !== i);
    const removedId = question.options[i]?.id;
    let correct = question.correctAnswer;
    if (Array.isArray(correct)) {
      correct = correct.filter((a) => a !== removedId);
    } else if (correct === removedId) {
      correct = "";
    }
    onUpdate({ options: opts, correctAnswer: correct });
  }

  return (
    <div className="rounded-xl border border-ink-900/10 bg-white shadow-soft">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-iris-50 text-[13px] font-semibold text-iris-600">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-ink-900">
            {question.prompt || "New question"}
          </p>
          <p className="text-[12.5px] text-ink-400">
            {QUESTION_TYPE_LABELS[question.type]} · {question.points} pt{question.points !== 1 ? "s" : ""}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-400 transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-ink-900/10 px-5 pb-5 pt-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Type</label>
              <div className="relative">
                <select
                  value={question.type}
                  onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                  className={`${fieldClass} appearance-none pr-8`}
                >
                  {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
                    <option key={t} value={t}>
                      {QUESTION_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              </div>
            </div>
            <div className="w-24">
              <label className={labelClass}>Points</label>
              <input
                type="number"
                min={1}
                value={question.points}
                onChange={(e) => onUpdate({ points: Math.max(1, Number(e.target.value)) })}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Question</label>
            <textarea
              value={question.prompt}
              onChange={(e) => onUpdate({ prompt: e.target.value })}
              rows={2}
              className={`${fieldClass} resize-none`}
              placeholder="Type your question here…"
            />
          </div>

          {(question.type === "multiple-choice" || question.type === "multiple-answer") && (
            <div>
              <label className={labelClass}>
                Options
                {question.type === "multiple-choice"
                  ? " (select one correct answer)"
                  : " (select all correct answers)"}
              </label>
              <div className="space-y-2">
                {question.options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    {question.type === "multiple-choice" ? (
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={question.correctAnswer === opt.id}
                        onChange={() => onUpdate({ correctAnswer: opt.id })}
                        className="h-4 w-4 shrink-0 accent-iris-500"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={Array.isArray(question.correctAnswer) && question.correctAnswer.includes(opt.id)}
                        onChange={(e) => {
                          const arr = Array.isArray(question.correctAnswer)
                            ? [...question.correctAnswer]
                            : [];
                          if (e.target.checked) {
                            onUpdate({ correctAnswer: [...arr, opt.id] });
                          } else {
                            onUpdate({ correctAnswer: arr.filter((a) => a !== opt.id) });
                          }
                        }}
                        className="h-4 w-4 shrink-0 accent-iris-500"
                      />
                    )}
                    <input
                      value={opt.value}
                      onChange={(e) => updateOption(i, e.target.value)}
                      className={`${fieldClass} !py-1.5`}
                      placeholder={`Option ${i + 1}`}
                    />
                    <button
                      onClick={() => removeOption(i)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-ink-300 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addOption}
                className="mt-2 flex items-center gap-1 text-[13px] font-medium text-iris-600 hover:text-iris-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add option
              </button>
            </div>
          )}

          {question.type === "true-false" && (
            <div>
              <label className={labelClass}>Correct answer</label>
              <div className="flex gap-3">
                {question.options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-[14px] font-medium transition ${
                      question.correctAnswer === opt.id
                        ? "border-iris-400 bg-iris-50 text-iris-700"
                        : "border-ink-900/10 text-ink-600 hover:border-ink-900/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`tf-${question.id}`}
                      value={opt.id}
                      checked={question.correctAnswer === opt.id}
                      onChange={() => onUpdate({ correctAnswer: opt.id })}
                      className="hidden"
                    />
                    {opt.value}
                  </label>
                ))}
              </div>
            </div>
          )}

          {question.type === "short-answer" && (
            <div>
              <label className={labelClass}>Correct answer (keyword match)</label>
              <input
                value={(question.correctAnswer as string) || ""}
                onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                className={fieldClass}
                placeholder="e.g. Hypertension"
              />
              <p className="mt-1 text-[12px] text-ink-400">
                Grading is case-insensitive; the student&apos;s answer must contain this keyword.
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>
              Explanation{" "}
              <span className="font-normal text-ink-300">(shown after student answers)</span>
            </label>
            <textarea
              value={question.explanation || ""}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              rows={2}
              className={`${fieldClass} resize-none`}
              placeholder="Explain why the correct answer is right…"
            />
          </div>

          <div className="flex justify-end border-t border-ink-900/10 pt-3">
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-[13px] font-medium text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
