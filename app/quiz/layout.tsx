import QuizShell from "@/components/quiz/QuizShell";

export const metadata = {
  title: "Quizzes",
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <QuizShell>{children}</QuizShell>;
}
