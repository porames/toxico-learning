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
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import formatTimeRange from "@/lib/formatTimeRange";

const fieldClass =
  "w-full rounded-lg border border-ink-900/12 bg-white px-3 py-2 text-[14px] text-ink-900 placeholder:text-ink-300 transition focus:border-iris-500 focus:ring-4 focus:ring-iris-500/15";
const labelClass = "mb-1.5 block text-[12.5px] font-medium text-ink-700";


export function defaultMaterialTitle(type: MaterialType) {
  switch (type) {
    case "youtube":
      return "New video";
    case "pdf":
      return "New PDF";
    case "file":
      return "New attached file";
    case "link":
      return "New link";
    case "text":
      return "New note";
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
  onSelect
}: {
  cls: ClassItem;
  onRename: (patch: Partial<Pick<ClassItem, "name" | "code">>) => void;
  onDelete: () => void;
  onAddLecture: () => void;
  onEnrolStudents: () => void;
  onSelect: (selection: Selection) => void;
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
      <div className="mt-2 flex-row border-b border-ink-900/10 pt-6 space-y-4 pb-8 text-sm">
        {cls.lectures && cls.lectures.map((lec) => {
          return (
            <div key={lec.id}>
              <button
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
            </div>
          );
        })}
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
  highlightMaterialId,
  onUpdate,
  onDelete,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}: {
  lecture: Lecture;
  classId: string,
  highlightMaterialId?: string;
  onUpdate: (patch: Partial<Pick<Lecture, "title" | "startTime" | "endTime">>) => void;
  onDelete: () => void;
  onAddMaterial: (type: MaterialType) => void;
  onUpdateMaterial: (materialId: string, patch: Partial<Pick<Material, "title" | "value">>) => void;
  onDeleteMaterial: (materialId: string) => void;
}) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
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
          value: doc.data()?.value
        }));
        setMaterials(materialsData);
      } catch (err) {
        console.log(err);
      }
      finally {
        setMaterialsLoading(false);
      }
    }
    loadLecture();
  }, [classId, lecture.id]);

  const materialTypes: MaterialType[] = ["youtube", "pdf", "link", "text", "file"];
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
    setMaterials([...materials, newMaterial]);
    console.log(materials);
  };

  async function saveChanges() {
    setSaving(true);
    try {
      await updateDoc(
        doc(db, "classes", classId, "lectures", lecture.id),
        {
          title: lecture.title,
          startTime: lecture.startTime,
          endTime: lecture.endTime,
        })
      await Promise.all(
        materials.map((material) => {
          const patch: Record<string, any> = {};
          if (material.type !== undefined) patch.type = material.type;
          if (material.title !== undefined) patch.title = material.title;
          if (material.value !== undefined) patch.value = material.value;

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

        <div className="mt-4 space-y-3">
          {materialsLoading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink-900/10 border-t-iris-600" />
              <span className="text-[13px] text-ink-500">Loading materials…</span>
            </div>
          ) : materials.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-ink-400">No materials yet.</p>
          ) : null}
          {!materialsLoading && materials.map((mat) => (
            <MaterialCard
              key={mat.id}
              material={mat}
              highlighted={mat.id === highlightMaterialId}
              onUpdate={(patch) => updateMaterial(mat.id, patch)}
              onDelete={() => onDeleteMaterial(mat.id)}
            />
          ))}
        </div>

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
                  onClick={() => addMaterial(type)}
                  className={`flex items-center gap-1.5 rounded-lg border border-ink-900/10 bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink-700 shadow-soft transition hover:border-transparent hover:${color.bg}`}
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

function MaterialCard({
  material,
  highlighted,
  onUpdate,
  onDelete,
}: {
  material: Material;
  highlighted?: boolean;
  onUpdate: (patch: Partial<Pick<Material, "title" | "value">>) => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = MATERIAL_ICON[material.type];
  const color = MATERIAL_COLOR[material.type];

  useEffect(() => {
    if (highlighted) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  return (
    <div
      ref={ref}
      className={`rounded-xl border bg-white p-3.5 transition ${highlighted ? `border-transparent ring-2 ${color.ring}` : "border-ink-900/10"
        }`}
    >
      <div className="flex items-start gap-2.5">
        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${color.bg} ${color.text}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={material.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Material title"
            className="w-full border-b border-transparent bg-transparent text-[13.5px] font-medium text-ink-900 outline-none placeholder:text-ink-300 focus:border-iris-400"
          />

          {material.type === "youtube" && (
            <input
              value={material.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className={`${fieldClass} !py-1.5 !text-[13px]`}
            />
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
            <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-ink-900/15 bg-ink-900/[0.015] px-3 py-2.5 text-[12.5px] text-ink-300">
              <PdfPlaceholderIcon />
              File upload coming soon — for now this material is a placeholder.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete material"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-ink-300 transition hover:bg-red-50 hover:text-red-500"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function PdfPlaceholderIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
