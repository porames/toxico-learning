"use client";

import { useMemo, useState, useEffect } from "react";
import type { ClassItem, Lecture, Material, MaterialType, Selection } from "./types";
import { initialClasses } from "./mockData";
import TreeView from "./TreeView";
import { ClassEditor, EmptyState, LectureEditor, defaultMaterialTitle } from "./EditorPanel";
import { Menu, Plus, UserRound, LogOut } from 'lucide-react';
import ManageStudents from "./ManageStudents";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, addDoc, serverTimestamp, getDoc, deleteDoc, doc } from "firebase/firestore";
import EnrolStudents from "./EnrolStudents";

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}


function defaultTimes() {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  const toLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`;
  };
  return { startTime: start, endTime: end };
}

export default function LectureDashboard() {
  //const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [classes, setClasses] = useState<ClassItem[] | []>([]);
  const [selection, setSelection] = useState<Selection>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [lectureLoading, setLectureLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(initialClasses.map((c) => c.id))
  );
  useEffect(() => {
    async function loadClasses() {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "classes"));
        const classesData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data()["name"],
          code: doc.data()["code"],
          lectures: undefined,
          students: doc.data()["enroledStudents"]
        }));
        setClasses(classesData);
      }
      catch (err) {
        console.log(err);
      }
      finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);
  const toggleExpand = async (classId: string, isExpanded: boolean) => {
    const id = classId;

    // Always toggle visibility
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

    // Only fetch if we're opening it AND haven't loaded lectures yet
    if (!isExpanded) {
      const currentClass = classes.find((cls) => cls.id === id);
      const alreadyLoaded = currentClass?.lectures !== undefined;
      console.log(currentClass)
      if (!alreadyLoaded) {
        console.log('loading')
        const snapshot = await getDocs(collection(db, "classes", id, "lectures"));
        const loadedLecs = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data()["title"],
          startTime: doc.data()["startTime"].toDate(),
          endTime: doc.data()["endTime"].toDate(),
          materials: [],
          materialsOrder: doc.data()["materialsOrder"] || [],
        }));

        setClasses((prevClasses) =>
          prevClasses.map((cls) =>
            cls.id === id ? { ...cls, lectures: loadedLecs } : cls
          )
        );
      }
      else {
        console.log('already loaded');
      }
    }
  };

  const expandIds = (ids: string[]) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });

  // ---- Class-level actions ----
  const addClass = async () => {
    const snapshot = await addDoc(collection(db, "classes"), {
      name: "New class",
      code: "",
      createdAt: serverTimestamp()
    });

    const newClass: ClassItem = { id: snapshot.id, name: "New class", code: "", lectures: [] };
    console.log(newClass)
    setClasses((prev) => [...prev, newClass]);
    expandIds([snapshot.id]);
    setSelection({ level: "class", classId: snapshot.id });
  };

  const manageStudents = () => {
    setSelection({ level: "manage_students" });
  };

  const renameClass = (classId: string, patch: Partial<Pick<ClassItem, "name" | "code">>) => {
    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, ...patch } : c)));
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    setSelection((sel) => (sel && sel.level === "class" && sel.classId === classId ? null : sel));
  };

  // ---- Lecture-level actions ----
  async function addLecture(classId: string) {
    const time = defaultTimes();
    const snapshot = await addDoc(collection(db, "classes", classId, "lectures"), {
      name: "New class",
      code: "",
      ...time,
      createdAt: serverTimestamp()
    });
    const newLecture: Lecture = { id: snapshot.id, title: "New lecture", ...time, materials: [] };
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, lectures: [...(c.lectures ?? []), newLecture] } : c))
    );
    expandIds([classId, snapshot.id]);
    setSelection({ level: "lecture", classId, lectureId: snapshot.id });
  }
  const updateLecture = (
    classId: string,
    lectureId: string,
    patch: Partial<Pick<Lecture, "title" | "startTime" | "endTime">>
  ) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id !== classId
          ? c
          : {
            ...c,
            lectures: (c.lectures ?? []).map((l) => (l.id === lectureId ? { ...l, ...patch } : l)),
          }
        )
      );
    };
  
    async function loadLecture(selection_data: Selection) {
    if (selection_data && selection_data.level == "class") {
      setLectureLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "classes", selection_data.classId, "lectures"));
        const loadedLecs = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data()["title"],
          startTime: doc.data()["startTime"].toDate(),
          endTime: doc.data()["endTime"].toDate(),
          materials: [],
          materialsOrder: doc.data()["materialsOrder"] || [],
        }));
        setClasses(prevClasses =>
          prevClasses.map(cls =>
            cls.id === selection_data.classId
              ? { ...cls, lectures: loadedLecs }
              : cls
          )
        );
        setExpanded((prev) => {
          const next = new Set(prev);
          next.has(selection_data.classId) ? next.delete(selection_data.classId) : next.add(selection_data.classId);
          return next;
        });
      }
      finally {
        setLectureLoading(false);
      }
    }
    setSelection(selection_data);
  }

  const deleteLecture = (classId: string, lectureId: string) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, lectures: (c.lectures ?? []).filter((l) => l.id !== lectureId) } : c))
    );
    setSelection((sel) =>
      sel && "lectureId" in sel && sel.lectureId === lectureId ? { level: "class", classId } : sel
    );
  };

  // ---- Material-level actions ----
  const addMaterial = (classId: string, lectureId: string, type: MaterialType) => {
    console.log(type)
    const id = makeId();
    const newMaterial: Material = { id, type, title: defaultMaterialTitle(type), value: "" };
    setClasses((prev) =>
      prev.map((c) =>
        c.id !== classId
          ? c
          : {
            ...c,
            lectures: (c.lectures ?? []).map((l) =>
              l.id === lectureId ? { ...l, materials: [...l.materials, newMaterial] } : l
            ),
          }
      )
    );
    expandIds([classId, lectureId]);
    setSelection({ level: "material", classId, lectureId, materialId: id });
  };

  const updateMaterial = (
    classId: string,
    lectureId: string,
    materialId: string,
    patch: Partial<Pick<Material, "title" | "value">>
  ) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id !== classId
          ? c
          : {
            ...c,
            lectures: (c.lectures ?? []).map((l) =>
              l.id !== lectureId
                ? l
                : { ...l, materials: l.materials.map((m) => (m.id === materialId ? { ...m, ...patch } : m)) }
            ),
          }
      )
    );
  };

  const deleteMaterial = (classId: string, lectureId: string, materialId: string) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id !== classId
          ? c
          : {
            ...c,
            lectures: (c.lectures ?? []).map((l) =>
              l.id !== lectureId ? l : { ...l, materials: l.materials.filter((m) => m.id !== materialId) }
            ),
          }
      )
    );
    setSelection((sel) =>
      sel && sel.level === "material" && sel.materialId === materialId
        ? { level: "lecture", classId, lectureId }
        : sel
    );
    deleteDoc(doc(db, "classes", classId, "lectures", lectureId, "materials", materialId)).catch(console.error);
  };

  // ---- Derived selection lookups ----
  const selectedClass = useMemo(
    () => (selection && "classId" in selection ? classes.find((c) => c.id === selection.classId) ?? null : null),
    [classes, selection]
  );
  const selectedLecture = useMemo(
    () =>
      ((selection && "lectureId" in selection) && (selectedClass && selectedClass.lectures))
        ? selectedClass?.lectures.find((l) => l.id === selection.lectureId) ?? null
        : null,
    [selectedClass, selection]
  );

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink-900/8 bg-white px-5">
        <div className="flex items-center gap-2.5">
          <Menu onClick={() => setShowMenu(!showMenu)} />
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-iris-600">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" fill="white" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-ink-900">Lecture Manager</span>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {showMenu && (
          <div
            className="fixed inset-0 z-10 bg-black/30 md:hidden"
            onClick={() => setShowMenu(false)}
          />
        )}
        <aside
          className={`flex w-[300px] shrink-0 flex-col border-r border-ink-900/8 bg-white md:relative md:z-auto md:flex ${showMenu ? "fixed inset-y-0 left-0 z-20 block" : "hidden"
            }`}
        >
          <div className="flex flex-col gap-0.5 px-2 py-2">
            <button
              type="button"
              onClick={addClass}
              className="flex items-center gap-2 rounded-lg border border-ink-900/10 bg-white px-3 py-2 text-[13px] font-semibold text-iris-600 transition hover:bg-iris-50"
            >
              <Plus className="h-4 w-4" />
              New class
            </button>
            <button
              type="button"
              onClick={manageStudents}
              className="flex items-center gap-2 rounded-lg border border-ink-900/10 bg-white px-3 py-2 text-[13px] font-semibold text-teal-600 transition hover:bg-teal-50"
            >
              <UserRound className="h-4 w-4" />
              Manage Students
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2">
            <TreeView
              classes={classes}
              selection={selection}
              expanded={expanded}
              onToggle={toggleExpand}
              onSelect={loadLecture}
              onAddLecture={addLecture}
              onAddMaterial={(classId, lectureId) => addMaterial(classId, lectureId, "text")}
              onDeleteClass={deleteClass}
              onDeleteLecture={deleteLecture}
              onDeleteMaterial={deleteMaterial}
            />
          </div>
          <div className="border-t border-ink-900/8 px-2 py-2">
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-900/10 border-t-iris-600" />
                <span className="text-[13px] text-ink-500">Loading classes…</span>
              </div>
            </div>
          ) : null}
          {!loading && (!selectedClass && !selection) && <EmptyState hasClasses={classes.length > 0} onAddClass={addClass} />}
          {!selectedClass && selection?.level === "manage_students" && (
            <div className="mx-auto max-w-full px-4 py-10">
              <div className="mt-4 grid grid-row gap-3">
                <h1>Manage students</h1>
                <ManageStudents enableSelection={false} />
              </div>
            </div>
          )}
          {selectedClass && selection?.level === "class" && (
            lectureLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-900/10 border-t-iris-600" />
                  <span className="text-[13px] text-ink-500">Loading lectures…</span>
                </div>
              </div>
            ) : (
              <ClassEditor
                cls={selectedClass}
                onSelect={loadLecture}
                onRename={(patch) => renameClass(selectedClass.id, patch)}
                onDelete={() => deleteClass(selectedClass.id)}
                onAddLecture={() => addLecture(selectedClass.id)}
                onEnrolStudents={() => setSelection({ level: "enrol_student", classId: selectedClass.id })}
              />
            )
          )}
          {selectedClass && (selection?.level === "enrol_student") && (
            <EnrolStudents classId={selectedClass.id} />
          )}
          {selectedClass && selectedLecture && (selection?.level === "lecture" || selection?.level === "material") && (
            <LectureEditor
              lecture={selectedLecture}
              classId={selectedClass.id}
              highlightMaterialId={selection.level === "material" ? selection.materialId : undefined}
              onUpdate={(patch) => updateLecture(selectedClass.id, selectedLecture.id, patch)}
              onDelete={() => deleteLecture(selectedClass.id, selectedLecture.id)}
              onAddMaterial={(type) => addMaterial(selectedClass.id, selectedLecture.id, type)}
              onUpdateMaterial={(materialId, patch) =>
                updateMaterial(selectedClass.id, selectedLecture.id, materialId, patch)
              }
              onDeleteMaterial={(materialId) => deleteMaterial(selectedClass.id, selectedLecture.id, materialId)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
