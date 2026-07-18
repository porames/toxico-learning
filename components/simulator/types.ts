import type { ReactNode, CSSProperties, InputHTMLAttributes, TextareaHTMLAttributes, MouseEvent } from "react";

export interface VitalSign {
  value: string;
  abnormal: boolean;
}

export interface VitalDef {
  key: string;
  label: string;
  unit: string;
  normal: [number, number];
}

export interface ExamFinding {
  id: string;
  system: string;
  finding: string;
  abnormal: boolean;
}

export interface LabInvestigation {
  id: string;
  kind: "lab";
  category: string;
  name: string;
  unit: string;
  normalRange: string;
  value: string;
  abnormal: boolean;
}

export interface ImagingInvestigation {
  id: string;
  kind: "imaging";
  category: string;
  name: string;
  unit: string;
  normalRange: string;
  value: string;
  abnormal: boolean;
  report: string;
  imageUrl?: string;
}

export type Investigation = LabInvestigation | ImagingInvestigation;

export interface DoseEntry {
  label: string;
  isDefault?: boolean;
}

export interface TimerNodeData {
  minutes: number;
  note: string;
}

export interface InterventionNodeData {
  actions: string[];
  doseMap?: Record<string, string>;
}

export interface RequiredOrGroup {
  or: string[];
}

export interface RequiredInterventionNodeData {
  actions: RequiredOrGroup[];
  doseMap?: Record<string, string>;
}

export type OutcomeKind = "improved" | "deteriorated" | "critical" | "unchanged" | "unlockEvent";

export type OutcomeNodeData =
  | { outcomeType: "improved"; narrative: string; newSymptoms: string; vitalChanges: Record<string, string> }
  | { outcomeType: "deteriorated"; narrative: string; newSymptoms: string; vitalChanges: Record<string, string> }
  | { outcomeType: "critical"; narrative: string; newSymptoms: string; vitalChanges: Record<string, string> }
  | { outcomeType: "unchanged"; narrative: string; newSymptoms: string; vitalChanges: Record<string, string> }
  | { outcomeType: "unlockEvent"; unlockedDispositions: string[] };

export interface EndNodeData {
  outcome: "win" | "lose";
  narrative: string;
}

export type ManagementNode =
  | { id: string; type: "start"; x: number; y: number; data: Record<string, never> }
  | { id: string; type: "timer"; x: number; y: number; data: TimerNodeData }
  | { id: string; type: "intervention"; x: number; y: number; data: InterventionNodeData }
  | { id: string; type: "required"; x: number; y: number; data: RequiredInterventionNodeData }
  | { id: string; type: "outcome"; x: number; y: number; data: OutcomeNodeData }
  | { id: string; type: "end"; x: number; y: number; data: EndNodeData };

export interface ManagementEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface ManagementGraph {
  nodes: ManagementNode[];
  edges: ManagementEdge[];
}

export interface CaseData {
  title: string;
  age: string;
  sex: string;
  chiefComplaint: string;
  diagnoses: string[];
  background: string;
  vitals: Record<string, VitalSign>;
  exam: ExamFinding[];
  investigations: Investigation[];
  managementGraph: ManagementGraph;
  historyGraph: HistoryGraph;
}

export interface OutcomeType {
  key: string;
  label: string;
  color: string;
  soft: string;
}

export interface LabTest {
  name: string;
  unit: string;
  normal: string;
}

export interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

export interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}

export interface GhostButtonProps {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  danger?: boolean;
}

export interface ChipProps {
  children: ReactNode;
  color: string;
  soft: string;
}

export interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
}

export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  desc?: string;
}

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  maxWidth?: string;
  zIndex?: string;
}

export type HistoryCategoryType = "signs_symptoms" | "past_history" | "medication" | "allergy" | "family_history" | "socioeconomics";

export interface HistoryNodeData {
  category: HistoryCategoryType;
  question: string;
  answer: string;
}

export interface HistoryNode {
  id: string;
  x: number;
  y: number;
  data: HistoryNodeData;
}

export interface HistoryEdge {
  id: string;
  source: string;
  target: string;
}

export interface HistoryGraph {
  nodes: HistoryNode[];
  edges: HistoryEdge[];
}

export interface StepProps {
  data: CaseData;
  update: (patch: Partial<CaseData>) => void;
}

export interface StepReviewProps {
  data: CaseData;
}

export interface GraphNodeProps {
  node: ManagementNode;
  selected: boolean;
  onMouseDownHeader: (e: MouseEvent<HTMLDivElement>, node: ManagementNode) => void;
  onStartConnect: (e: MouseEvent<HTMLDivElement>, nodeId: string) => void;
}

export type SelectionKind = { kind: "node"; id: string } | { kind: "edge"; id: string } | null;

export interface ConnectLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface NodeSize {
  w: number;
  h: number;
}

export interface NodeMeta {
  label: string;
  color: string;
  soft: string;
}

export type PlayerEvent =
  | { kind: "game_start"; timestamp: number }
  | { kind: "vitals_requested"; timestamp: number }
  | { kind: "exam_performed"; timestamp: number; system: string }
  | { kind: "test_ordered"; timestamp: number; name: string }
  | { kind: "intervention_applied"; timestamp: number; name: string; dose?: string }
  | { kind: "outcome"; timestamp: number; outcomeType: OutcomeKind }
  | { kind: "timer_expired"; timestamp: number }
  | { kind: "game_over"; timestamp: number; reason: string };
