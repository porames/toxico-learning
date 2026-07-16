"use client";

import { useState, useEffect } from "react";
import type { ClassItem, Lecture, Selection } from "../dashboard/types";
import { Menu, ChevronLeft, FileText, Link as LinkIcon, Video, File } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import formatTimeRange from "@/lib/formatTimeRange";

export default function StudentDashboard({ classId }: { classId: string }) {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [selection, setSelection] = useState<Selection>(null);
    const [showMenu, setShowMenu] = useState<boolean>(false);

    const [classesLoading, setClassesLoading] = useState(true);
    const [classesError, setClassesError] = useState<string | null>(null);
    const [lecturesLoading, setLecturesLoading] = useState(false);
    const [lecturesError, setLecturesError] = useState<string | null>(null);
    const [materialsLoading, setMaterialsLoading] = useState(false);
    const [materialsError, setMaterialsError] = useState<string | null>(null);

    const router = useRouter();

    // Load the full class list once (used for the "pick a class" screen and the header title).
    useEffect(() => {
        async function loadClasses() {
            setClassesLoading(true);
            setClassesError(null);
            try {
                const snapshot = await getDocs(collection(db, "classes"));
                const classesData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data()["name"],
                    code: doc.data()["code"],
                    lectures: [],
                }));
                setClasses(classesData);
            } catch (err) {
                console.error(err);
                setClassesError("Couldn't load classes. Try refreshing the page.");
            } finally {
                setClassesLoading(false);
            }
        }
        loadClasses();
    }, []);

    // Load lectures whenever the selected class changes.
    useEffect(() => {
        if (!classId) {
            setLectures([]);
            setSelection(null);
            return;
        }

        async function loadLectures() {
            setLecturesLoading(true);
            setLecturesError(null);
            setSelection(null);
            try {
                const snapshot = await getDocs(collection(db, "classes", classId, "lectures"));
                const lecturesData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    title: doc.data().title,
                    startTime: doc.data().startTime.toDate(),
                    endTime: doc.data().endTime.toDate(),
                    materials: [],
                }));
                setLectures(lecturesData);
            } catch (err) {
                console.error(err);
                setLecturesError("Couldn't load lectures. Try refreshing the page.");
            } finally {
                setLecturesLoading(false);
            }
        }
        loadLectures();
    }, [classId]);

    async function handleLecSelection(lec: Lecture) {
        setSelection({ level: "lecture", classId: classId, lectureId: lec.id });

        // Materials already fetched for this lecture — no need to hit Firestore again.
        const existing = lectures.find((l) => l.id === lec.id);
        if (existing && existing.materials.length > 0) return;

        setMaterialsLoading(true);
        setMaterialsError(null);
        try {
            const snapshot = await getDocs(
                collection(db, "classes", classId, "lectures", lec.id, "materials")
            );
            const materials = snapshot.docs.map((doc) => ({
                id: doc.id,
                type: doc.data().type,
                title: doc.data().title,
                value: doc.data().value,
            }));

            setLectures((prev) =>
                prev.map((l) => (l.id === lec.id ? { ...l, materials } : l))
            );
        } catch (err) {
            console.error(err);
            setMaterialsError("Couldn't load materials for this lecture.");
        } finally {
            setMaterialsLoading(false);
        }
    }

    const currentClass = classes.find((c) => c.id === classId);
    const selectedLecture = lectures.find(
        (l) => selection?.level === "lecture" && l.id === selection.lectureId
    );

    function materialIcon(type: string) {
        switch (type) {
            case "video":
                return <Video size={16} className="text-iris-600 shrink-0" />;
            case "link":
                return <LinkIcon size={16} className="text-iris-600 shrink-0" />;
            case "pdf":
                return <FileText size={16} className="text-iris-600 shrink-0" />;
            default:
                return <File size={16} className="text-iris-600 shrink-0" />;
        }
    }

    return (
        <div className="flex h-screen flex-col bg-canvas">
            <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-ink-900/8 bg-white px-5">
                <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="md:hidden text-ink-900/60 hover:text-ink-900"
                    aria-label="Toggle menu"
                >
                    <Menu size={20} />
                </button>
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-iris-600 shrink-0">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                        <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" fill="white" />
                    </svg>
                </div>
                <span className="text-[14px] font-semibold tracking-tight text-ink-900">
                    Lecture Manager
                </span>
                {currentClass && (
                    <>
                        <span className="text-ink-900/20">/</span>
                        <span className="text-[13px] text-ink-900/60">{currentClass.name}</span>
                    </>
                )}
            </header>

            <div className="flex min-h-0 flex-1">
                <aside
                    className={`w-[300px] shrink-0 overflow-y-auto border-r border-ink-900/8 bg-white px-2 py-3 ${showMenu ? "block" : "hidden"
                        } md:block`}
                >
                    <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-900/40">
                        Classes
                    </p>
                    {classesLoading ? (
                        <div className="space-y-1.5 px-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-7 w-full animate-pulse rounded-md bg-ink-900/5" />
                            ))}
                        </div>
                    ) : classesError ? (
                        <p className="px-2 text-[12px] text-red-600">{classesError}</p>
                    ) : (
                        classes.map((cls) => (
                            <button
                                key={cls.id}
                                type="button"
                                onClick={() => router.push(`/classes/${cls.id}`)}
                                className={`block w-full rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${cls.id === classId
                                    ? "bg-iris-600/10 font-medium text-iris-600"
                                    : "text-ink-900/70 hover:bg-ink-900/5"
                                    }`}
                            >
                                {cls.name}
                            </button>
                        ))
                    )}
                </aside>

                {!classId ? (
                    <main className="flex flex-1 flex-col items-center justify-center gap-2 overflow-y-auto px-5 text-center">
                        <p className="text-[14px] font-medium text-ink-900">Pick a class</p>
                        <p className="max-w-xs text-[13px] text-ink-900/50">
                            Choose a class from the sidebar to see its lectures and materials.
                        </p>
                    </main>
                ) : (
                    <main className="flex flex-1 min-w-0 overflow-hidden">
                        {/* Lecture list */}
                        <div className="w-[280px] shrink-0 overflow-y-auto border-r border-ink-900/8 px-2 py-3">
                            <div className="mb-2 flex items-center gap-1.5 px-2">
                                <button
                                    type="button"
                                    onClick={() => router.push("/classes")}
                                    className="text-ink-900/40 hover:text-ink-900"
                                    aria-label="Back to classes"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-900/40">
                                    Lectures
                                </p>
                            </div>

                            {lecturesLoading ? (
                                <div className="space-y-1.5 px-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="h-12 w-full animate-pulse rounded-md bg-ink-900/5" />
                                    ))}
                                </div>
                            ) : lecturesError ? (
                                <p className="px-2 text-[12px] text-red-600">{lecturesError}</p>
                            ) : lectures.length === 0 ? (
                                <p className="px-2 text-[12px] text-ink-900/40">
                                    No lectures yet for this class.
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {lectures.map((lec) => (
                                        <button
                                            key={lec.id}
                                            type="button"
                                            onClick={() => handleLecSelection(lec)}
                                            className={`block w-full rounded-md px-2 py-1.5 text-left transition-colors ${selection?.level === "lecture" && selection.lectureId === lec.id
                                                ? "bg-iris-600/10"
                                                : "hover:bg-ink-900/5"
                                                }`}
                                        >
                                            <p className="text-[13px] font-medium text-ink-900">{lec.title}</p>
                                            <p className="text-[11px] text-ink-900/50">
                                                {formatTimeRange(lec.startTime, lec.endTime)}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Materials panel */}
                        <div className="flex-1 min-w-0 overflow-y-auto px-6 py-5">
                            {!selectedLecture ? (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                                    <p className="text-[14px] font-medium text-ink-900">Select a lecture</p>
                                    <p className="max-w-xs text-[13px] text-ink-900/50">
                                        Pick a lecture from the list to see its materials.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-[15px] font-semibold text-ink-900">
                                        {selectedLecture.title}
                                    </h2>
                                    <p className="mt-0.5 text-[12px] text-ink-900/50">
                                        {formatTimeRange(selectedLecture.startTime, selectedLecture.endTime)}
                                    </p>

                                    <div className="mt-4">
                                        {materialsLoading ? (
                                            <div className="space-y-2">
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="h-10 w-full animate-pulse rounded-md bg-ink-900/5"
                                                    />
                                                ))}
                                            </div>
                                        ) : materialsError ? (
                                            <p className="text-[12px] text-red-600">{materialsError}</p>
                                        ) : selectedLecture.materials.length === 0 ? (
                                            <p className="text-[12px] text-ink-900/40">
                                                No materials uploaded for this lecture yet.
                                            </p>
                                        ) : (
                                            <ul className="space-y-1.5">
                                                {selectedLecture.materials.map((mat) => (
                                                    <li key={mat.id}>
                                                        <a
                                                            href={mat.value}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 rounded-md border border-ink-900/8 px-3 py-2 text-[13px] text-ink-900 transition-colors hover:bg-ink-900/5"
                                                        >
                                                            {materialIcon(mat.type)}
                                                            <span className="truncate">{mat.title}</span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                )}
            </div>
        </div>
    );
}