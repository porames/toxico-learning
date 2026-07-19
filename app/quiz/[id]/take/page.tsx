import QuizTaker from "@/components/quiz/QuizTaker";

export const metadata = {
  title: "Take Quiz",
};

export default function TakeQuizPage({ params }: { params: { id: string } }) {
  return <QuizTaker quizId={params.id} />;
}
