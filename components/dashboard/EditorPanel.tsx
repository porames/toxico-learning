"use client";

import { useEffect, useRef, useState } from "react";
import type { ClassItem, Lecture, Material, MaterialType, Selection } from "./types";
import { MATERIAL_LABELS } from "./types";
import {
  FolderIcon,
  PlusIcon,
  TrashIcon,
  MATERIAL_ICON,
  MATERIAL_COLOR,
} from "./icons";
import { db, auth, storage } from "@/lib/firebase";
import { collection, doc, getDocs, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import formatTimeRange from "@/lib/formatTimeRange";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, FileQuestion, X, ChevronRight } from "lucide-react";
import moment from "moment";

const fieldClass =
  "w-full rounded-md bg-white px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-300 outline-1 -outline-offset-1 outline-ink-900/15 focus:outline-2 focus:-outline-offset-2 focus:outline-iris-500 transition";
const labelClass = "mb-1.5 block text-[12.5px] font-medium text-ink-700";


export function defaultMaterialTitle(type: MaterialType) {
  switch (type) {
    case "youtube":
      return "New video";
    case "pdf":
      return "New file";
    case "file":
      return "New file";
    case "link":
      return "New link";
    case "text":
      return "New note";
    case "video":
      return "New video";
    case "quiz":
      return "New quiz";
  }
}

export function EmptyState({ hasClasses, onAddClass }: { hasClasses: boolean; onAddClass: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-iris-50 text-iris-500">
        <FolderIcon className="h-6 w-6" />
      </div>
      <p className="mt-4 text-[15px] font-medium text-ink-900">
        {hasClasses ? "Nothing selected yet" : "No classes yet"}
      </p>
      <p className="mt-1 max-w-xs text-[13.5px] text-ink-500">
        {hasClasses
          ? "Pick a class, lecture, or material from the tree to view and edit its details here."
          : "Create your first class to start building out lectures and materials."}
      </p>
      {!hasClasses && (
        <button
          type="button"
          onClick={onAddClass}
          className="mt-5 flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 px-4 py-2 text-[13.5px] font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          New class
        </button>
      )}
    </div>
  );
}

export function ClassEditor({
  cls,
  onRename,
  onDelete,
  onAddLecture,
  onEnrolStudents,
  onSelect,
  onBackToClasses,
}: {
  cls: ClassItem;
  onRename: (patch: Partial<Pick<ClassItem, "name" | "code">>) => void;
  onDelete: () => void;
  onAddLecture: () => void;
  onEnrolStudents: () => void;
  onSelect: (selection: Selection) => void;
  onBackToClasses?: () => void;
}) {
  const [saving, setSaving] = useState<boolean>(false);
  async function saveChanges() {
    setSaving(true);
    try {
      await updateDoc(
        doc(db, "classes", cls.id),
        {
          name: cls.name,
          code: cls.code,
        })
    }
    catch (err) {
      console.log(err);
    }
    finally {
      setSaving(false);
    }
  }
  return (
    <div className="mx-auto max-w-xl px-8 py-10">
      <div className="md:hidden flex items-center gap-1.5 mb-4">
        {onBackToClasses ? (
          <button type="button" onClick={onBackToClasses} className="text-[12px] text-ink-400 hover:text-iris-600 transition-colors">
            All Classes
          </button>
        ) : (
          <span className="text-[12px] text-ink-400">All Classes</span>
        )}
        <ChevronRight className="h-3 w-3 text-ink-300" />
        <span className="text-[12px] font-medium text-ink-900">{cls.name}</span>
      </div>
      <p className="text-[12px] font-medium uppercase tracking-wider text-ink-300">Class</p>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label className={labelClass}>Class name</label>
          <input
            value={cls.name}
            onChange={(e) => onRename({ name: e.target.value })}
            className={fieldClass}
            placeholder="e.g. Introduction to Algorithms"
          />
        </div>
        <div className="w-28">
          <label className={labelClass}>Code</label>
          <input
            value={cls.code}
            onChange={(e) => onRename({ code: e.target.value })}
            className={fieldClass}
            placeholder="CS 201"
          />
        </div>

      </div>
      <button
        type="button"
        disabled={saving}
        className="mt-4 flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => saveChanges()}
      >
        {saving ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Saving…
          </>
        ) : (
          "Save changes"
        )}
      </button>

      <div className="mt-8 flex items-center justify-between border-t border-ink-900/10 pt-6">
        <div>
          <p className="text-[13.5px] font-medium text-ink-900">
            {cls.students ? cls.students.length : 0} students enroled in this class
          </p>
          <p className="text-[12.5px] text-ink-500">Manage students enrolment.</p>
        </div>
        <button
          type="button"
          onClick={onEnrolStudents}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Enrol students
        </button>
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-ink-900/10 pt-6">
        <div>
          <p className="text-[13.5px] font-medium text-ink-900">
            {cls.lectures && cls.lectures.length} {cls.lectures && cls.lectures.length === 1 ? "lecture" : "lectures"}
          </p>
          <p className="text-[12.5px] text-ink-500">Add a lecture to start scheduling materials.</p>
        </div>
        <button
          type="button"
          onClick={onAddLecture}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add lecture
        </button>
      </div>
      <div className="mt-2 flex-row border-b border-ink-900/10 pt-6 pb-8 text-sm">
        {cls.lectures && (() => {
          const groups = new Map<string, Lecture[]>();
          for (const lec of cls.lectures) {
            const key = moment(lec.startTime).format("YYYY-MM-DD");
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(lec);
          }
          return Array.from(groups.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, lectures]: [string, Lecture[]]) => (
              <div key={key} className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-2">
                  {moment(lectures[0].startTime).format("ddd, MMM D, YYYY")}
                </p>
                <div className="space-y-2">
                  {lectures.map((lec) => (
                    <button
                      key={lec.id}
                      onClick={() => onSelect({ level: "lecture", classId: cls.id, lectureId: lec.id })}
                      className="w-full text-left rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-900 truncate">
                          {lec.title || "Untitled lecture"}
                        </p>
                        <p className="shrink-0 text-sm text-gray-500">
                          {formatTimeRange(lec.startTime, lec.endTime)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ));
        })()}
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="mt-8 text-[13px] font-medium text-red-500 hover:text-red-600"
      >
        Delete this class
      </button>
    </div>
  );
}

export function LectureEditor({
  lecture,
  classId,
  className,
  highlightMaterialId,
  onUpdate,
  onDelete,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onSelect,
  onBackToClasses,
}: {
  lecture: Lecture;
  classId: string,
  className?: string;
  highlightMaterialId?: string;
  onUpdate: (patch: Partial<Pick<Lecture, "title" | "startTime" | "endTime">>) => void;
  onDelete: () => void;
  onAddMaterial: (type: MaterialType) => void;
  onUpdateMaterial: (materialId: string, patch: Partial<Pick<Material, "title" | "value">>) => void;
  onDeleteMaterial: (materialId: string) => void;
  onSelect?: (selection: Selection) => void;
  onBackToClasses?: () => void;
}) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [order, setOrder] = useState<string[]>([]);
  const [showQuizPicker, setShowQuizPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {

    setMaterials([]);
    setMaterialsLoading(true);
    async function loadLecture() {
      try {
        const snapshot = await getDocs(
          collection(db, "classes", classId, "lectures", lecture.id, "materials")
        );
        const materialsData = snapshot.docs.map(doc => ({
          id: doc.id,
          type: doc.data()?.type,
          title: doc.data()?.title,
          value: doc.data()?.value,
          requiredPostTest: doc.data()?.requiredPostTest ?? false
        }));
        const lecOrder = lecture.materialsOrder;
        if (lecOrder && lecOrder.length > 0) {
          materialsData.sort((a, b) => {
            const aIdx = lecOrder.indexOf(a.id);
            const bIdx = lecOrder.indexOf(b.id);
            return (aIdx === -1 ? Infinity : aIdx) - (bIdx === -1 ? Infinity : bIdx);
          });
          setOrder(lecOrder);
        } else {
          setOrder(materialsData.map(m => m.id));
        }
        setMaterials(materialsData);
      } catch (err) {
        console.log(err);
      }
      finally {
        setMaterialsLoading(false);
      }
    }
    loadLecture();
  }, [classId, lecture.id, lecture.materialsOrder]);

  const materialTypes: MaterialType[] = ["video", "file", "link", "text", "quiz"];
  function dateToStringInput(date: Date) {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
  }
  function stringInputToDate(strDate: string) {
    return new Date(strDate);
  }

  function updateMaterial(
    materialId: string,
    patch: Partial<Pick<Material, "title" | "value">>
  ) {
    setMaterials(materials.map(m =>
      m.id === materialId ? { ...m, ...patch } : m
    ));
  }
  async function addMaterial(type: MaterialType) {
    console.log(type)
    const id = "xxx";
    const docRef = await addDoc(collection(db, "classes", classId, "lectures", lecture.id, "materials"), {
      type: type,
      title: defaultMaterialTitle(type),
      value: "",
      createdAt: serverTimestamp()
    });
    const newMaterial: Material = { id: docRef.id, type: type, title: defaultMaterialTitle(type), value: "" };
    const newOrder = [...order, docRef.id];
    setOrder(newOrder);
    setMaterials([...materials, newMaterial]);
    await updateDoc(
      doc(db, "classes", classId, "lectures", lecture.id),
      { materialsOrder: newOrder }
    );
    console.log(materials);
  };

  async function addMaterialWithQuiz(quizId: string, quizTitle: string) {
    const docRef = await addDoc(collection(db, "classes", classId, "lectures", lecture.id, "materials"), {
      type: "quiz",
      title: quizTitle,
      value: quizId,
      createdAt: serverTimestamp()
    });
    const newMaterial: Material = { id: docRef.id, type: "quiz", title: quizTitle, value: quizId };
    const newOrder = [...order, docRef.id];
    setOrder(newOrder);
    setMaterials([...materials, newMaterial]);
    await updateDoc(
      doc(db, "classes", classId, "lectures", lecture.id),
      { materialsOrder: newOrder }
    );
  }

  function handleAddMaterial(type: MaterialType) {
    if (type === "quiz") {
      setShowQuizPicker(true);
    } else {
      addMaterial(type);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as string);
    const newIndex = order.indexOf(over.id as string);
    const newOrder = arrayMove(order, oldIndex, newIndex);
    setOrder(newOrder);
    setMaterials((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const aIdx = newOrder.indexOf(a.id);
        const bIdx = newOrder.indexOf(b.id);
        return aIdx - bIdx;
      });
      return sorted;
    });
    await updateDoc(
      doc(db, "classes", classId, "lectures", lecture.id),
      { materialsOrder: newOrder }
    );
  }

  async function saveChanges() {
    setSaving(true);
    try {
      const lecturePatch: Record<string, any> = {};
      if (lecture.title !== undefined) lecturePatch.title = lecture.title;
      if (lecture.startTime !== undefined) lecturePatch.startTime = lecture.startTime;
      if (lecture.endTime !== undefined) lecturePatch.endTime = lecture.endTime;
      await updateDoc(
        doc(db, "classes", classId, "lectures", lecture.id),
        lecturePatch)
      await Promise.all(
        materials.map((material) => {
          const patch: Record<string, any> = {};
          if (material.type !== undefined) patch.type = material.type;
          if (material.title !== undefined) patch.title = material.title;
          if (material.value !== undefined) patch.value = material.value;
          if (material.requiredPostTest !== undefined) patch.requiredPostTest = material.requiredPostTest;

          return updateDoc(
            doc(db, "classes", classId, "lectures", lecture.id, "materials", material.id),
            patch
          );
        })
      );
    } catch (err) {
      console.log(err);
    }
    finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-8 py-10">
      <div className="md:hidden flex items-center gap-1.5 mb-4">
        {onBackToClasses ? (
          <button type="button" onClick={onBackToClasses} className="text-[12px] text-ink-400 hover:text-iris-600 transition-colors">
            All Classes
          </button>
        ) : (
          <span className="text-[12px] text-ink-400">All Classes</span>
        )}
        <ChevronRight className="h-3 w-3 text-ink-300" />
        {onSelect && className ? (
          <button type="button" onClick={() => onSelect({ level: "class", classId })} className="text-[12px] text-ink-400 hover:text-iris-600 transition-colors">
            {className}
          </button>
        ) : (
          <span className="text-[12px] text-ink-400">{className || classId}</span>
        )}
        <ChevronRight className="h-3 w-3 text-ink-300" />
        <span className="text-[12px] font-medium text-ink-900">{lecture.title || "Untitled lecture"}</span>
      </div>
      <div className="flex item-center justify-between">
        <p className="text-[12px] font-medium uppercase tracking-wider text-ink-300">Lecture</p>
        <button
          type="button"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => saveChanges()}
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
      <div className="mt-4">
        <label className={labelClass}>Lecture title</label>
        <input
          value={lecture.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className={fieldClass}
          placeholder="e.g. Sorting Algorithms"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Start time</label>
          <input
            type="datetime-local"
            value={dateToStringInput(lecture.startTime)}
            onChange={(e) => onUpdate({ startTime: stringInputToDate(e.target.value) })}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>End time</label>
          <input
            type="datetime-local"
            value={dateToStringInput(lecture.endTime)}
            onChange={(e) => onUpdate({ endTime: stringInputToDate(e.target.value) })}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="mt-9 border-t border-ink-900/10 pt-6">
        <p className="text-[13.5px] font-medium text-ink-900">
          Class materials
          <span className="ml-1.5 font-normal text-ink-300">({materials.length})</span>
        </p>

        {materialsLoading ? (
          <div className="flex items-center justify-center gap-2 py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink-900/10 border-t-iris-600" />
            <span className="text-[13px] text-ink-500">Loading materials…</span>
          </div>
        ) : materials.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-ink-400">No materials yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              <div className="mt-4 space-y-3">
                {materials.map((mat) => (
                  <MaterialCard
                    key={mat.id}
                    id={mat.id}
                    material={mat}
                    classId={classId}
                    lectureId={lecture.id}
                    highlighted={mat.id === highlightMaterialId}
                    onUpdate={(patch) => updateMaterial(mat.id, patch)}
                    onDelete={() => {
                      const newOrder = order.filter(id => id !== mat.id);
                      setOrder(newOrder);
                      setMaterials(materials.filter(m => m.id !== mat.id));
                      updateDoc(
                        doc(db, "classes", classId, "lectures", lecture.id),
                        { materialsOrder: newOrder }
                      );
                      onDeleteMaterial(mat.id);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <div className="mt-4">
          <p className="mb-2 text-[12.5px] font-medium text-ink-500">Add material</p>
          <div className="flex flex-wrap gap-2">
            {materialTypes.map((type) => {
              const Icon = MATERIAL_ICON[type];
              const color = MATERIAL_COLOR[type];
              return (
                <button
                  key={type}
                  type="button"
                  disabled={materialsLoading}
                  onClick={() => handleAddMaterial(type)}
                  className={`flex items-center gap-1.5 rounded-lg border border-ink-900/10 bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink-700 shadow-soft transition hover:border-transparent hover:${color.bg} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded ${color.bg} ${color.text}`}>
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  {MATERIAL_LABELS[type]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showQuizPicker && (
        <QuizPickerModal
          onSelect={(quizId, quizTitle) => {
            addMaterialWithQuiz(quizId, quizTitle);
            setShowQuizPicker(false);
          }}
          onClose={() => setShowQuizPicker(false)}
        />
      )}

      <button
        type="button"
        onClick={onDelete}
        className="mt-9 text-[13px] font-medium text-red-500 hover:text-red-600"
      >
        Delete this lecture
      </button>
    </div>
  );
}

function QuizPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (quizId: string, quizTitle: string) => void;
  onClose: () => void;
}) {
  const [quizzes, setQuizzes] = useState<{ id: string; title: string; questions: any[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, "quizzes"));
        setQuizzes(snap.docs.map((d) => ({ id: d.id, title: d.data().title || "Untitled", questions: d.data().questions || [] })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-lg rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4">
          <p className="text-[15px] font-semibold text-ink-900">Link a quiz</p>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded text-ink-400 hover:bg-ink-900/5 hover:text-ink-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink-900/10 border-t-iris-600" />
            </div>
          ) : quizzes.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-400">
              No quizzes yet.{" "}
              <button
                onClick={() => { onClose(); window.open("/quiz/new", "_blank"); }}
                className="text-iris-600 underline hover:text-iris-700"
              >
                Create one
              </button>
            </p>
          ) : (
            <div className="space-y-2">
              {quizzes.map((q) => (
                <button
                  key={q.id}
                  onClick={() => onSelect(q.id, q.title)}
                  className="flex w-full items-center gap-3 rounded-lg border border-ink-900/10 px-4 py-3 text-left transition hover:border-iris-400 hover:bg-iris-50"
                >
                  <FileQuestion className="h-5 w-5 shrink-0 text-iris-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-ink-900">{q.title}</p>
                    <p className="text-[12px] text-ink-400">{q.questions.length} questions</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="border-t border-ink-900/10 mt-3 pt-3">
            <button
              onClick={() => { onClose(); window.open("/quiz/new", "_blank"); }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-900/15 px-3 py-2 text-[13px] font-medium text-iris-600 transition hover:border-iris-400 hover:bg-iris-50"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Create new quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialCard({
  material,
  classId,
  lectureId,
  highlighted,
  onUpdate,
  onDelete,
  id,
}: {
  material: Material;
  classId: string;
  lectureId: string;
  highlighted?: boolean;
  onUpdate: (patch: Partial<Pick<Material, "title" | "value">>) => void;
  onDelete: () => void;
  id: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ? `${transition}, opacity 200ms ease` : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };
  const Icon = MATERIAL_ICON[material.type];
  const color = MATERIAL_COLOR[material.type];
  const [videoMode, setVideoMode] = useState<"youtube" | "upload">("youtube");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoId, setVideoId] = useState(material.value || "");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [requiredPostTest, setRequiredPostTest] = useState(material.requiredPostTest ?? false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(material.type === "pdf" ? material.value || "" : "");
  const [fileUploading, setFileUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState(material.type === "file" ? material.value || "" : "");

  useEffect(() => {
    if (!videoId) { setEmbedUrl(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(
          "https://us-central1-rama-toxico-edu.cloudfunctions.net/getVideoPlaybackUrl",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ videoId }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setEmbedUrl(data.embedUrl);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { cancelled = true; };
  }, [videoId]);

  useEffect(() => {
    if (highlighted) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  async function handleVideoUpload(file: File) {
    setUploading(true);
    setProgress(0);
    try {
      const token = await auth.currentUser?.getIdToken();
      const uploadRes = await fetch(
        "https://us-central1-rama-toxico-edu.cloudfunctions.net/getVideoUploadUrl",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: material.title || file.name }),
        }
      );
      if (!uploadRes.ok) throw new Error("Failed to get upload URL");
      const { apiKey, libraryId, videoId } = await uploadRes.json();
      const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => resolve();
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("AccessKey", apiKey);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
        xhr.send(file);
      });

      setVideoId(videoId);
      onUpdate({ value: videoId });
      await updateDoc(
        doc(db, "classes", classId, "lectures", lectureId, "materials", material.id),
        { value: videoId }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handlePdfUpload(file: File) {
    setPdfUploading(true);
    setPdfProgress(0);
    try {
      const storageRef = ref(storage, `materials/${material.id}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on("state_changed", (snapshot) => {
        setPdfProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      });
      await uploadTask;
      const downloadUrl = await getDownloadURL(storageRef);
      setPdfUrl(downloadUrl);
      onUpdate({ value: downloadUrl });
      await updateDoc(
        doc(db, "classes", classId, "lectures", lectureId, "materials", material.id),
        { value: downloadUrl }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setPdfUploading(false);
    }
  }

  async function handleFileUpload(file: File) {
    setFileUploading(true);
    setFileProgress(0);
    try {
      const storageRef = ref(storage, `materials/${material.id}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on("state_changed", (snapshot) => {
        setFileProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      });
      await uploadTask;
      const downloadUrl = await getDownloadURL(storageRef);
      setFileUrl(downloadUrl);
      onUpdate({ value: downloadUrl });
      await updateDoc(
        doc(db, "classes", classId, "lectures", lectureId, "materials", material.id),
        { value: downloadUrl }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setFileUploading(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border bg-white p-3.5 ${highlighted ? `border-transparent ring-2 ${color.ring}` : "border-ink-900/10"
        }`}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1 flex h-6 w-5 shrink-0 cursor-grab items-center justify-center rounded text-ink-300 transition active:cursor-grabbing hover:text-ink-500"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${color.bg} ${color.text}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>

          <div className="min-w-0 flex-1 space-y-2">
            <input
              value={material.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Material title"
              className="w-full rounded-md bg-white px-3 py-2 text-[13.5px] font-medium text-ink-900 placeholder:text-ink-300 outline-1 -outline-offset-1 outline-ink-900/15 focus:outline-2 focus:-outline-offset-2 focus:outline-iris-500 transition"
            />

            {material.type === "youtube" && (
              <div className="space-y-2">
                <input
                  value={material.value}
                  onChange={(e) => onUpdate({ value: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className={`${fieldClass} !py-1.5 !text-[13px] ${material.value && !getYoutubeVideoId(material.value) ? "outline-red-400 focus:outline-red-500" : ""}`}
                />
                {material.value && !getYoutubeVideoId(material.value) && (
                  <p className="text-[12px] text-red-500">Please enter a valid YouTube link</p>
                )}
                {getYoutubeVideoId(material.value) && (
                  <div className="overflow-hidden rounded-lg border border-ink-900/8">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(material.value)}`}
                        className="h-full w-full"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {material.type === "link" && (
              <input
                value={material.value}
                onChange={(e) => onUpdate({ value: e.target.value })}
                placeholder="https://example.com/resource"
                className={`${fieldClass} !py-1.5 !text-[13px]`}
              />
            )}

            {material.type === "text" && (
              <textarea
                value={material.value}
                onChange={(e) => onUpdate({ value: e.target.value })}
                placeholder="Write the note or instructions here…"
                rows={3}
                className={`${fieldClass} resize-none !py-1.5 !text-[13px]`}
              />
            )}

            {material.type === "pdf" && (
              <div className="space-y-2">
                {!pdfUrl ? (
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-900/15 bg-ink-900/[0.015] px-3 py-2 text-[12.5px] text-ink-500 hover:border-iris-400 hover:text-iris-600 transition-colors">
                      <PdfUploadIcon />
                      {pdfUploading ? `Uploading ${pdfProgress}%` : "Choose PDF file"}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        disabled={pdfUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePdfUpload(file);
                        }}
                      />
                    </label>
                    {pdfUploading && (
                      <div className="flex-1 h-2 rounded-full bg-ink-900/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-iris-500 transition-all duration-300"
                          style={{ width: `${pdfProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[12.5px] text-emerald-600">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-emerald-700 truncate max-w-[200px]"
                    >
                      View PDF
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfUrl("");
                        onUpdate({ value: "" });
                      }}
                      className="text-[12px] text-ink-400 hover:text-red-500 underline ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {material.type === "file" && (
              <div className="space-y-2">
                {!fileUrl ? (
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-900/15 bg-ink-900/[0.015] px-3 py-2 text-[12.5px] text-ink-500 hover:border-iris-400 hover:text-iris-600 transition-colors">
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="9" y1="15" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="15" y1="15" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {fileUploading ? `Uploading ${fileProgress}%` : "Choose file"}
                      <input
                        type="file"
                        accept="image/*,.ppt,.pptx,.docx,.pdf"
                        className="hidden"
                        disabled={fileUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </label>
                    {fileUploading && (
                      <div className="flex-1 h-2 rounded-full bg-ink-900/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-iris-500 transition-all duration-300"
                          style={{ width: `${fileProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[12.5px] text-emerald-600">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-emerald-700 truncate max-w-[200px]"
                    >
                      View file
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setFileUrl("");
                        onUpdate({ value: "" });
                      }}
                      className="text-[12px] text-ink-400 hover:text-red-500 underline ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {material.type === "quiz" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-5 w-5 shrink-0 text-iris-500" />
                  <span className="text-[13px] text-ink-700">{material.title || "Untitled quiz"}</span>
                  {material.value && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/quiz/${material.value}/edit`, "_blank");
                      }}
                      className="ml-auto text-[12px] font-medium text-iris-600 underline hover:text-iris-700"
                    >
                      Edit quiz
                    </button>
                  )}
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-600">
                  <input
                    type="checkbox"
                    checked={requiredPostTest}
                    onChange={async (e) => {
                      const checked = e.target.checked;
                      setRequiredPostTest(checked);
                      try {
                        await updateDoc(
                          doc(db, "classes", classId, "lectures", lectureId, "materials", material.id),
                          { requiredPostTest: checked }
                        );
                      } catch (err) {
                        console.error(err);
                        setRequiredPostTest(!checked);
                      }
                    }}
                    className="h-3.5 w-3.5 rounded border-ink-900/20 text-iris-500"
                  />
                  Required post-test
                </label>
              </div>
            )}

            {material.type === "video" && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setVideoMode("youtube")}
                    className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${videoMode === "youtube" ? "bg-iris-600 text-white" : "bg-ink-900/5 text-ink-700 hover:bg-ink-900/10"}`}
                  >
                    YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoMode("upload")}
                    className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${videoMode === "upload" ? "bg-iris-600 text-white" : "bg-ink-900/5 text-ink-700 hover:bg-ink-900/10"}`}
                  >
                    Upload
                  </button>
                </div>

                {videoMode === "youtube" ? (
                  <div className="space-y-2">
                    <input
                      value={material.value}
                      onChange={(e) => onUpdate({ value: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className={`${fieldClass} !py-1.5 !text-[13px] ${material.value && !getYoutubeVideoId(material.value) ? "outline-red-400 focus:outline-red-500" : ""}`}
                    />
                    {material.value && !getYoutubeVideoId(material.value) && (
                      <p className="text-[12px] text-red-500">Please enter a valid YouTube link</p>
                    )}
                    {material.value && getYoutubeVideoId(material.value) && (
                      <div className="overflow-hidden rounded-lg border border-ink-900/8">
                        <div className="aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYoutubeVideoId(material.value)}`}
                            className="h-full w-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : !videoId ? (
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-900/15 bg-ink-900/[0.015] px-3 py-2 text-[12.5px] text-ink-500 hover:border-iris-400 hover:text-iris-600 transition-colors">
                      <VideoUploadIcon />
                      {uploading ? `Uploading ${progress}%` : "Choose video file"}
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoUpload(file);
                        }}
                      />
                    </label>
                    {uploading && (
                      <div className="flex-1 h-2 rounded-full bg-ink-900/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-iris-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {embedUrl ? (
                      <div className="overflow-hidden rounded-lg border border-ink-900/8">
                        <div className="aspect-video">
                          <iframe
                            src={embedUrl}
                            className="h-full w-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[12.5px] text-ink-500">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-900/10 border-t-iris-600" />
                        Loading video…
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[12.5px] text-emerald-600">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Video uploaded
                      <button
                        type="button"
                        onClick={() => {
                          setVideoId("");
                          setEmbedUrl(null);
                          onUpdate({ value: "" });
                        }}
                        className="text-[12px] text-ink-400 hover:text-red-500 underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={deleting}
            onClick={async () => {
              if (deleting) return;
              setDeleting(true);
              try {
                if (material.type === "video" && videoId) {
                  const token = await auth.currentUser?.getIdToken();
                  await fetch(
                    "https://us-central1-rama-toxico-edu.cloudfunctions.net/deleteVideo",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ videoId }),
                    }
                  );
                }
                if (material.type === "pdf" && pdfUrl) {
                  await deleteObject(ref(storage, `materials/${material.id}`));
                }
              } catch (err) {
                console.error(err);
              } finally {
                setDeleting(false);
                onDelete();
              }
            }}
            aria-label="Delete material"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-ink-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
          >
            {deleting ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-900/10 border-t-red-500" />
            ) : (
              <TrashIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function VideoUploadIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PdfUploadIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="15" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="15" y1="15" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
