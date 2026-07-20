import { redirect } from "next/navigation";

export const metadata = {
  title: "Take Quiz",
};

export default function TakeQuizPage({ params }: { params: { id: string } }) {
  redirect(`/quiz/${params.id}`);
}
