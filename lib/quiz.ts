import { db } from "./firebase";
import { collection, collectionGroup, query, where, getDocs } from "firebase/firestore";
import type { Question, QuizAttempt } from "@/components/quiz/types";

export function gradeQuestion(
  question: Question,
  answer: string | string[]
): boolean {
  switch (question.type) {
    case "multiple-choice":
    case "true-false":
      return answer === question.correctAnswer;
    case "multiple-answer": {
      if (!Array.isArray(answer) || !Array.isArray(question.correctAnswer))
        return false;
      if (answer.length !== question.correctAnswer.length) return false;
      return answer.every((a) => question.correctAnswer.includes(a));
    }
    case "short-answer":
      return (answer as string)
        .toLowerCase()
        .includes((question.correctAnswer as string).toLowerCase());
  }
}

export function gradeQuiz(
  questions: Question[],
  answers: Record<string, string | string[]>
): { score: number; totalPoints: number; passed: boolean; graded: { questionId: string; correct: boolean }[] } {
  let score = 0;
  let totalPoints = 0;
  const graded: { questionId: string; correct: boolean }[] = [];

  for (const q of questions) {
    totalPoints += q.points;
    const answer = answers[q.id];
    if (answer === undefined || answer === null || answer === "") {
      graded.push({ questionId: q.id, correct: false });
      continue;
    }
    const correct = gradeQuestion(q, answer);
    if (correct) score += q.points;
    graded.push({ questionId: q.id, correct });
  }

  const pct = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
  return { score, totalPoints, passed: pct >= 60, graded };
}

export async function getQuizAttempts(
  quizId: string
): Promise<QuizAttempt[]> {
  const q = query(
    collectionGroup(db, "quizAttempts"),
    where("quizId", "==", quizId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as QuizAttempt)
  );
}

export async function getUserAttempts(
  userId: string
): Promise<QuizAttempt[]> {
  const snap = await getDocs(
    collection(db, "users", userId, "quizAttempts")
  );
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as QuizAttempt)
  );
}
