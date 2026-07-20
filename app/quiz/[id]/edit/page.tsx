import QuizCreator from "@/components/quiz/QuizCreator";

export const metadata = {
  title: "Edit Quiz",
};

export default function EditQuizPage({ params }: { params: { id: string } }) {
  return <QuizCreator quizId={params.id} />;
}
