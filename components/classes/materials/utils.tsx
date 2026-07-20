import { Video, FileText, Link as LinkIcon, MessageCircleWarning, FileQuestion, File } from "lucide-react";
import type { ReactNode } from "react";

export function materialTypeLabel(type: string): string {
  switch (type) {
    case "video": return "Video";
    case "youtube": return "YouTube";
    case "link": return "Link";
    case "pdf": return "PDF";
    case "text": return "Note";
    case "quiz": return "Quiz";
    default: return "File";
  }
}

export function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/");
    const last = segments[segments.length - 1] || url;
    return decodeURIComponent(last);
  } catch {
    return url;
  }
}

export function materialIcon(type: string): ReactNode {
  switch (type) {
    case "video":
    case "youtube":
      return <Video size={16} className="shrink-0" />;
    case "link":
      return <LinkIcon size={16} className="shrink-0" />;
    case "pdf":
      return <FileText size={16} className="shrink-0" />;
    case "text":
      return <MessageCircleWarning size={16} className="shrink-0" />;
    case "quiz":
      return <FileQuestion size={16} className="shrink-0" />;
    default:
      return <File size={16} className="shrink-0" />;
  }
}
