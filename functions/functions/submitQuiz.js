import {onRequest} from "firebase-functions/v2/https";
import admin from "firebase-admin";
import {db} from "../lib/admin.js";
import {handleCors} from "../lib/cors.js";
import {verifyUser} from "../lib/auth.js";

function gradeQuestion(question, answer) {
  if (answer === undefined || answer === null || answer === "") return false;
  switch (question.type) {
    case "multiple-choice":
    case "true-false":
      return answer === question.correctAnswer;
    case "multiple-answer": {
      if (!Array.isArray(answer) || !Array.isArray(question.correctAnswer)) {
        return false;
      }
      if (answer.length !== question.correctAnswer.length) return false;
      return answer.every((a) => question.correctAnswer.includes(a));
    }
    case "short-answer":
      return answer
          .toLowerCase()
          .includes(question.correctAnswer.toLowerCase());
    default:
      return false;
  }
}

export const submitQuiz = onRequest(async (req, res) => {
  try {
    if (handleCors(req, res)) return;
    const userData = await verifyUser(req);

    const {quizId, lectureId, answers} = req.body;
    if (!quizId || !lectureId || !answers) {
      res.status(400).json({error: "Missing data points"});
      return;
    }

    const quizSnap = await db.collection("quizzes").doc(quizId).get();
    if (!quizSnap.exists) {
      return res.status(404).json({message: `Quiz was not found: ${quizId}`});
    }

    const quizData = quizSnap.data();
    const passingScore = quizData.passingScore ?? 70;
    let score = 0;
    let totalPoints = 0;
    const graded = [];

    (quizData.questions || []).forEach((q) => {
      totalPoints += q.points;
      const answer = answers[q.id];
      const correct = gradeQuestion(q, answer);
      if (correct) score += q.points;
      graded.push({questionId: q.id, correct});
    });

    const pct = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = pct >= passingScore;

    const attemptRef = db
        .collection("quizAttempts")
        .doc();

    await attemptRef.set({
      quizId,
      lectureId,
      authId: userData.uid,
      score,
      totalPoints,
      passed,
      answers: graded.map((g) => ({
        questionId: g.questionId,
        answer: answers[g.questionId] || "",
        correct: g.correct,
      })),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      id: attemptRef.id,
      score,
      totalPoints,
      passed,
      pct,
    });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({error: err.message || "Something went wrong"});
  }
});
