import QuizOverview from "@/components/quiz/QuizOverview";

export const metadata = {
  title: "Quiz",
};

export default function QuizOverviewPage({ params }: { params: { id: string } }) {
  return <QuizOverview quizId={params.id} />;
}
