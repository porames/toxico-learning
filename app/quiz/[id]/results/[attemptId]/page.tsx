import QuizResults from "@/components/quiz/QuizResults";

export const metadata = {
  title: "Quiz Results",
};

export default function ResultsPage({
  params,
}: {
  params: { id: string; attemptId: string };
}) {
  return <QuizResults quizId={params.id} attemptId={params.attemptId} />;
}
