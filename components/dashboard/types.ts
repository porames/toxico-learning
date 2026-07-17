export type MaterialType = "youtube" | "pdf" | "link" | "text" | "file";

export interface Material {
  id: string;
  type: MaterialType;
  title: string;
  /** youtube -> video URL, link -> URL, text -> body copy, pdf -> unused for now */
  value: string;
}

export interface Lecture {
  id: string;
  title: string;
  startTime: Date; // ISO datetime-local string
  endTime: Date; // ISO datetime-local string
  materials: Material[];

}

export interface ClassItem {
  id: string;
  name: string;
  code: string;
  lectures?: Lecture[];
  students?: [];
}

export type Selection =
  | { level: "class"; classId: string }
  | { level: "manage_students" }
  | { level: "enrol_student"; classId: string }
  | { level: "lecture"; classId: string; lectureId: string }
  | { level: "material"; classId: string; lectureId: string; materialId: string }
  | null;

export interface Student {
  uid: string;
  rama_id: string;
  name: string;
  email: string;
  role?: string;
  year: string;
}

export const MATERIAL_LABELS: Record<MaterialType, string> = {
  youtube: "YouTube video",
  pdf: "PDF file",
  link: "External link",
  text: "Text",
  file: "Attached file"
};
