import MaterialText from "./MaterialText";
import MaterialYouTube from "./MaterialYouTube";
import MaterialVideo from "./MaterialVideo";
import MaterialQuiz from "./MaterialQuiz";
import MaterialLink from "./MaterialLink";
import MaterialEmpty from "./MaterialEmpty";
import { materialIcon } from "./utils";

interface MaterialData {
  id: string;
  type: string;
  title: string;
  value: string;
  requiredPostTest?: boolean;
}

interface MaterialRendererProps {
  material: MaterialData;
  color: { bg: string; text: string };
  videoUrls: Record<string, string>;
  onStartQuiz: (quizId: string) => void;
  quizAttempts: Record<string, { passed: boolean; completedAt: Date | null }>;
}

export default function MaterialRenderer({
  material,
  color,
  videoUrls,
  onStartQuiz,
  quizAttempts,
}: MaterialRendererProps) {
  const icon = materialIcon(material.type);
  const shared = {
    icon,
    title: material.title,
    type: material.type,
    bg: color.bg,
    text: color.text,
  };

  if (material.type === "text") {
    return <MaterialText {...shared} value={material.value} />;
  }

  if (material.type === "youtube" && material.value) {
    return <MaterialYouTube {...shared} url={material.value} />;
  }

  if (material.type === "video" && videoUrls[material.id]) {
    return <MaterialVideo {...shared} embedUrl={videoUrls[material.id]} />;
  }

  if (material.type === "quiz" && material.value) {
    return (
      <MaterialQuiz
        {...shared}
        quizId={material.value}
        requiredPostTest={material.requiredPostTest}
        onStartQuiz={onStartQuiz}
        attempt={quizAttempts[material.value]}
      />
    );
  }

  if (material.value) {
    return <MaterialLink {...shared} url={material.value} />;
  }

  return <MaterialEmpty {...shared} />;
}
