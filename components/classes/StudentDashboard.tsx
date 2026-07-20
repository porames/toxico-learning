"use client";

import { useState, useEffect, useMemo } from "react";
import type { ClassItem, Lecture, Selection, CompletedLecture } from "../dashboard/types";
import { ChevronLeft, LogOut, Check } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import formatTimeRange from "@/lib/formatTimeRange";
import { MATERIAL_COLOR } from "../dashboard/icons";
import { signOut } from "firebase/auth";
import moment from "moment";
import QuizTaker from "../quiz/QuizTaker";
import MaterialRenderer from "./materials/MaterialRenderer";
import { QuizAttempt } from "../quiz/types";
import UserInfoCard from "../UserInfoCard";
import NavigationList from "../NavigationList";
import { useUserProfile } from "@/hooks/useUserProfile";

// Groups lectures by calendar day (using local time, not UTC) and returns
// them keyed by "YYYY-MM-DD", sorted chronologically within each day.
function groupLecturesByDate(lectures: Lecture[]): Record<string, Lecture[]> {
    const sorted = [...lectures].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return sorted.reduce<Record<string, Lecture[]>>((groups, lec) => {
        const d = new Date(lec.startTime);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
        ).padStart(2, "0")}`;

        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(lec);
        return groups;
    }, {});
}

// Turns a "YYYY-MM-DD" key into a friendly header like "Today", "Tomorrow",
// or "Thursday, Jul 16".
function formatDateHeader(dateKey: string): string {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isSameDay = (a: Date, b: Date): boolean =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    //if (isSameDay(date, today)) return "Today";
    //if (isSameDay(date, tomorrow)) return "Tomorrow";

    return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
    });
}

// Human-readable label for a material's type badge.

// Best-effort filename extraction from a storage/CDN URL, so uploaded files
// show something more meaningful than a long signed URL.

export default function StudentDashboard({ classId }: { classId?: string }) {
    const { user, profile: userProfile, loading: authLoading } = useUserProfile();
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [selection, setSelection] = useState<Selection>(null);

    const [classesLoading, setClassesLoading] = useState(true);
    const [classesError, setClassesError] = useState<string | null>(null);
    const [lecturesLoading, setLecturesLoading] = useState(false);
    const [lecturesError, setLecturesError] = useState<string | null>(null);
    const [materialsLoading, setMaterialsLoading] = useState(false);
    const [materialsError, setMaterialsError] = useState<string | null>(null);
    const [completedLecs, setCompletedLecs] = useState<CompletedLecture[]>([]);
    const [completingLec, setCompletingLec] = useState(false);
    const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
    const [displayQuiz, setDisplayQuiz] = useState<string | null>(null);
    const [quizAttempts, setQuizAttempts] = useState<Record<string, { passed: boolean; completedAt: Date | null }>>({});
    const [quizResult, setQuizResult] = useState<{ id: string; score: number; totalPoints: number; passed: boolean; pct: number } | null>(null);
    const [quizViewKey, setQuizViewKey] = useState(0);
    const router = useRouter();

    // Load the full class list once (used for the "pick a class" screen and the header title).
    useEffect(() => {
        async function loadClasses() {
            if (authLoading || !user || !userProfile) return;
            setClassesLoading(true);
            setClassesError(null);
            try {
                console.log("=== FIRESTORE TIMING ===");
                console.time("getDocs classes");
                const snapshot = await getDocs(collection(db, "classes"));
                console.timeEnd("getDocs classes");
                console.log("classes count:", snapshot.docs.length);
                const classesData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data()["name"],
                    code: doc.data()["code"],
                    lectures: [],
                }));
                setClasses(classesData);
                console.time("getDocs completedLectures");
                const completedLecSnap = await getDocs(
                    collection(db, "users", userProfile.docId, "completedLectures")
                );
                console.timeEnd("getDocs completedLectures");
                const completedLectures = completedLecSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as CompletedLecture[];
                console.log("completedLectures count:", completedLectures.length)
                setCompletedLecs(completedLectures);

            } catch (err) {
                console.error(err);
                setClassesError("Couldn't load classes. Try refreshing the page.");
            } finally {
                setClassesLoading(false);
            }
        }
        loadClasses();
    }, [user, authLoading, userProfile]);

    // Load lectures whenever the selected class changes.
    useEffect(() => {
        if (!classId) {
            setLectures([]);
            setSelection(null);
            return;
        }

        async function loadLectures() {
            if (!classId) return;
            setLecturesLoading(true);
            setLecturesError(null);
            setSelection(null);
            try {
                console.log("=== Loading lectures for class:", classId, "===");
                console.time("getDocs lectures");
                const snapshot = await getDocs(collection(db, "classes", classId, "lectures"));
                console.timeEnd("getDocs lectures");
                console.log("lectures count:", snapshot.docs.length);
                const lecturesData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    title: doc.data().title,
                    startTime: doc.data().startTime.toDate(),
                    endTime: doc.data().endTime.toDate(),
                    materials: [],
                    materialsOrder: doc.data().materialsOrder || [],
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
        if (!classId) return;
        setSelection({ level: "lecture", classId, lectureId: lec.id });

        // Materials already fetched for this lecture — no need to hit Firestore again.
        const existing = lectures.find((l) => l.id === lec.id);
        if (existing && existing.materials.length > 0) return;

        setMaterialsLoading(true);
        setMaterialsError(null);
        try {
            console.log("=== Loading materials for lecture:", lec.id, "===");
            console.time("getDocs materials");
            const snapshot = await getDocs(
                collection(db, "classes", classId, "lectures", lec.id, "materials")
            );
            console.timeEnd("getDocs materials");
            console.log("materials count:", snapshot.docs.length);
            const materials = snapshot.docs.map((doc) => ({
                id: doc.id,
                type: doc.data().type,
                title: doc.data().title,
                value: doc.data().value,
                requiredPostTest: doc.data()?.requiredPostTest
            }));

            const lecOrder = lec.materialsOrder;
            if (lecOrder && lecOrder.length > 0) {
                materials.sort((a, b) => {
                    const aIdx = lecOrder.indexOf(a.id);
                    const bIdx = lecOrder.indexOf(b.id);
                    return (aIdx === -1 ? Infinity : aIdx) - (bIdx === -1 ? Infinity : bIdx);
                });
            }

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
    const groupedLectures = useMemo(() => groupLecturesByDate(lectures), [lectures]);
    const completedIds = useMemo(() => new Set(completedLecs.map((c) => c.lectureId)), [completedLecs]);
    const requiredQuizValues = selectedLecture?.materials
        .filter((m) => m.type === "quiz" && m.requiredPostTest)
        .map((m) => m.value) ?? [];
    const allRequiredPassed = requiredQuizValues.every(
        (v) => quizAttempts[v]?.passed
    );

    useEffect(() => {
        if (!selectedLecture || !user) return;
        selectedLecture.materials.forEach(async (mat) => {
            console.log(mat)
            if (mat.type === "video" && !videoUrls[mat.id] && mat.value) {
                try {
                    const token = await user.getIdToken();
                    const res = await fetch(
                        "https://us-central1-rama-toxico-edu.cloudfunctions.net/getVideoPlaybackUrl",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ videoId: mat.value }),
                        }
                    );
                    if (res.ok) {
                        const { embedUrl } = await res.json();
                        const url = embedUrl.includes("?")
                            ? embedUrl + "&autoplay=false"
                            : embedUrl + "?autoplay=false";
                        setVideoUrls((prev) => ({ ...prev, [mat.id]: url }));
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            if (mat.type === "quiz" && mat.value) {
                const q = query(collection(db, "quizAttempts"),
                    where("authId", "==", user.uid),
                    where("quizId", "==", mat.value),
                    where("lectureId", "==", selectedLecture?.id));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const attempts = snapshot.docs.map((d) => ({
                        id: d.id,
                        passed: d.data().passed as boolean,
                        completedAt: d.data().completedAt as any,
                    }));
                    const firstPassed = attempts
                        .filter((a) => a.passed)
                        .sort((a, b) => {
                            const aTime = a.completedAt?.toDate?.()?.getTime() ?? 0;
                            const bTime = b.completedAt?.toDate?.()?.getTime() ?? 0;
                            return aTime - bTime;
                        })[0];
                    const lastAttempt = attempts.sort((a, b) => {
                        const aTime = a.completedAt?.toDate?.()?.getTime() ?? 0;
                        const bTime = b.completedAt?.toDate?.()?.getTime() ?? 0;
                        return bTime - aTime;
                    })[0];
                    setQuizAttempts((prev) => ({
                        ...prev,
                        [mat.value]: {
                            passed: !!firstPassed,
                            completedAt: firstPassed
                                ? firstPassed.completedAt?.toDate?.() ?? null
                                : lastAttempt.completedAt?.toDate?.() ?? null,
                        },
                    }));
                }
            }

        });
    }, [selectedLecture, user, displayQuiz]);

    async function completedLec() {
        if (completingLec) return;
        if (selection?.level !== "lecture" || !user) return;
        if (completedIds.has(selection.lectureId)) return;

        setCompletingLec(true);
        try {
            const uid = user.uid;
            const q = query(collection(db, "users"), where("authId", "==", uid));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                throw new Error("User document not found");
            }

            const userDoc = snapshot.docs[0];
            await setDoc(doc(db, "users", userDoc.id, "completedLectures", selection.lectureId), {
                classId: classId,
                lectureId: selection.lectureId,
                completedAt: serverTimestamp(),
            });

            setCompletedLecs((prev) => [
                ...prev,
                {
                    id: selection.lectureId,
                    classId: classId ?? "",
                    lectureId: selection.lectureId,
                    completedAt: serverTimestamp() as any,
                },
            ]);
        } catch (err) {
            console.log(err);
        } finally {
            setCompletingLec(false);
        }
    }
    async function handleLogout() {
        await signOut(auth);
        router.push("/login");
    }

    if (authLoading) return null;

    return (
        <div className="flex h-screen flex-col bg-canvas">
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink-900/8 bg-white px-5">
                <div className="flex items-center gap-1 sm:gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-iris-600">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                            <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" fill="white" />
                        </svg>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push("/classes")}
                        className="shrink-0 text-sm font-semibold tracking-tight text-ink-900 hover:text-iris-600 transition-colors"
                    >
                        All Classes
                    </button>
                    {currentClass && (
                        <>
                            <span className="hidden md:inline text-ink-900/20 shrink-0">/</span>
                            <button
                                type="button"
                                onClick={() => router.push(`/classes/${currentClass.id}`)}
                                className="hidden md:block truncate text-sm text-ink-900/60 hover:text-iris-600 transition-colors"
                            >
                                {currentClass.name}
                            </button>
                        </>
                    )}
                    {selectedLecture && (
                        <>
                            <span className="hidden md:inline text-ink-900/20 shrink-0">/</span>
                            <span className="hidden md:block truncate text-sm font-medium text-ink-900">{selectedLecture.title}</span>
                        </>
                    )}
                </div>
            </header>

            <div className="flex min-h-0 flex-1">
                <aside
                    className={`flex flex-col border-r border-ink-900/8 bg-white ${classId ? 'hidden md:flex md:w-[300px] md:shrink-0' : 'flex w-full md:w-[300px] md:shrink-0'
                        }`}
                >
                    <div className="flex-1 overflow-y-auto px-2 pt-3">
                        {userProfile && (
                            <UserInfoCard
                                name={userProfile.name}
                                email={userProfile.email}
                                year={userProfile.year}
                                role={userProfile.role}
                            />
                        )}
                        <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-300">
                            Navigation
                        </p>
                        <NavigationList isAdmin={userProfile?.role === "admin" || userProfile?.role === "teacher"} />
                        <div className="mx-2 my-2 border-t border-ink-900/8" />
                        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-300">
                            Classes
                        </p>
                        {classesLoading ? (
                            <div className="space-y-1.5 px-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-7 w-full animate-pulse rounded-md bg-ink-900/5" />
                                ))}
                            </div>
                        ) : classesError ? (
                            <p className="px-2 text-xs text-red-600">{classesError}</p>
                        ) : (
                            classes.map((cls) => (
                                <button
                                    key={cls.id}
                                    type="button"
                                    onClick={() => router.push(`/classes/${cls.id}`)}
                                    className={`block w-full rounded-md px-2 py-2 md:py-1.5 text-left text-sm transition-colors ${cls.id === classId
                                        ? "bg-iris-600/10 font-medium text-iris-600"
                                        : "text-ink-900/70 hover:bg-ink-900/5"
                                        }`}
                                >
                                    {cls.name}
                                </button>
                            ))
                        )}
                    </div>
                    <div className="border-t border-ink-900/8 px-2 py-2">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </aside>

                {!classId ? (
                    <main className="hidden md:flex flex-1 flex-col items-center justify-center gap-2 overflow-y-auto px-5 text-center">
                        <p className="text-sm font-medium text-ink-900">Pick a class</p>
                        <p className="max-w-xs text-sm text-ink-900/50">
                            Choose a class from the sidebar to see its lectures and materials.
                        </p>
                    </main>
                ) : (
                    <main className="flex flex-1 min-w-0 overflow-hidden">
                        {/* Lecture list */}
                        <div className={`overflow-y-auto border-r border-ink-900/8 px-6 py-5 ${selectedLecture ? 'hidden md:block md:w-[280px] md:shrink-0' : 'block w-full md:w-[280px] md:shrink-0'
                            }`}>
                            <div className="flex md:hidden items-center gap-1 pb-2 min-w-0 mb-2">
                                <button
                                    type="button"
                                    onClick={() => router.push("/classes")}
                                    className="text-ink-900/40 hover:text-ink-900 shrink-0"
                                    aria-label="Back to classes"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push("/classes")}
                                    className="text-xs text-ink-900/40 hover:text-ink-900 shrink-0"
                                >
                                    All Classes
                                </button>
                                <span className="text-xs text-ink-900/20 shrink-0">/</span>
                                <button
                                    type="button"
                                    onClick={() => router.push(`/classes/${currentClass?.id}`)}
                                    className="text-xs font-medium text-ink-900 hover:text-iris-600 truncate"
                                >
                                    {currentClass?.name}
                                </button>
                            </div>

                            <div className="-mx-4 px-2">
                                {lecturesLoading ? (
                                    <div className="space-y-1.5">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="h-12 w-full animate-pulse rounded-md bg-ink-900/5" />
                                        ))}
                                    </div>
                                ) : lecturesError ? (
                                    <p className="text-xs text-red-600">{lecturesError}</p>
                                ) : lectures.length === 0 ? (
                                    <p className="text-xs text-ink-900/40">
                                        No lectures yet for this class.
                                    </p>
                                ) : (
                                    <div>
                                        {Object.entries(groupedLectures).map(([dateKey, lecsForDay]) => (
                                            <div key={dateKey} className="mb-4 last:mb-0">
                                                <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-ink-900/40">
                                                    {formatDateHeader(dateKey)}
                                                </p>
                                                <div className="space-y-1">
                                                    {lecsForDay.map((lec) => (
                                                        <button
                                                            key={lec.id}
                                                            type="button"
                                                            onClick={() => handleLecSelection(lec)}
                                                            className={`block w-full rounded-md py-2 px-2 md:py-1.5 text-left transition-colors ${selection?.level === "lecture" && selection.lectureId === lec.id
                                                                    ? "bg-iris-600/10"
                                                                    : "hover:bg-ink-900/5"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-medium text-ink-900 flex-1">{lec.title ? lec.title : "Untitled"}</p>
                                                                {completedIds.has(lec.id) && (
                                                                    <Check size={14} className="shrink-0 text-teal-500" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-ink-900/50">
                                                                {formatTimeRange(lec.startTime, lec.endTime)}
                                                            </p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Materials panel */}
                        <div className={`flex-1 min-w-0 overflow-y-auto px-6 py-5 ${selectedLecture || displayQuiz ? 'block' : 'hidden md:block'
                            }`}>
                            {displayQuiz ? (
                                <div>
                                    <button
                                        onClick={() => setDisplayQuiz(null)}
                                        className="mb-4 flex items-center gap-1.5 text-[13.5px] font-medium text-ink-500 hover:text-ink-900 transition"
                                    >
                                        <ChevronLeft size={16} />
                                        Back to materials
                                    </button>
                                    <QuizTaker key={quizViewKey} quizId={displayQuiz} lectureId={selectedLecture!.id} onComplete={(result) => setQuizResult(result)} />
                                </div>
                            ) : null}
                            {quizResult && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setQuizResult(null); setDisplayQuiz(null); }}>
                                    <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
                                        <p className={`text-5xl font-bold text-center ${quizResult.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {quizResult.pct}%
                                        </p>
                                        <div className="mt-3 flex justify-center">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${quizResult.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                {quizResult.passed ? 'Passed' : 'Failed'}
                                            </span>
                                        </div>
                                        <p className="mt-4 text-center text-sm text-ink-500">
                                            {quizResult.score} / {quizResult.totalPoints} points
                                        </p>
                                        <button
                                            onClick={() => { setQuizResult(null); setQuizViewKey((k) => k + 1); }}
                                            className="mt-6 flex w-full items-center justify-center rounded-lg bg-gradient-to-b from-iris-500 to-iris-700 px-4 py-2 text-sm font-semibold text-white shadow-button transition hover:from-iris-500 hover:to-iris-800"
                                        >
                                            View quiz attempts
                                        </button>
                                    </div>
                                </div>
                            )}
                            {!displayQuiz && (!selectedLecture ? (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                                    <p className="text-sm font-medium text-ink-900">Select a lecture</p>
                                    <p className="max-w-xs text-sm text-ink-900/50">
                                        Pick a lecture from the list to see its materials.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {/* Mobile breadcrumb */}
                                    <div className="flex md:hidden items-center gap-1 mb-4 min-w-0">
                                        <button
                                            type="button"
                                            onClick={() => setSelection(null)}
                                            className="text-ink-900/40 hover:text-ink-900 shrink-0"
                                            aria-label="Back to lectures"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => router.push("/classes")}
                                            className="text-xs text-ink-900/40 hover:text-ink-900 shrink-0"
                                        >
                                            All Classes
                                        </button>
                                        <span className="text-xs text-ink-900/20 shrink-0">/</span>
                                        <button
                                            type="button"
                                            onClick={() => setSelection(null)}
                                            className="text-xs text-ink-900/60 hover:text-iris-600 truncate"
                                        >
                                            {currentClass?.name}
                                        </button>
                                        <span className="text-xs text-ink-900/20 shrink-0">/</span>
                                        <span className="text-xs font-medium text-ink-900 truncate">{selectedLecture?.title}</span>
                                    </div>

                                    <h2 className="text-base font-semibold text-ink-900">
                                        {selectedLecture.title}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-ink-900/50">
                                            {moment(selectedLecture.startTime).format("Do MMM")} · {formatTimeRange(selectedLecture.startTime, selectedLecture.endTime)}
                                        </p>
                                        {completedIds.has(selectedLecture.id) && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-600">
                                                <Check size={12} />
                                                Completed
                                            </span>
                                        )}
                                    </div>

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
                                            <p className="text-xs text-red-600">{materialsError}</p>
                                        ) : selectedLecture.materials.length === 0 ? (
                                            <p className="text-xs text-ink-900/40">
                                                No materials uploaded for this lecture yet.
                                            </p>
                                        ) : (
                                            <ul className="space-y-1.5">
                                                {selectedLecture.materials.map((mat) => {
                                                    const color = MATERIAL_COLOR[mat.type];
                                                    return (
                                                        <li key={mat.id}>
                                                            <MaterialRenderer
                                                                material={mat}
                                                                color={color}
                                                                videoUrls={videoUrls}
                                                                onStartQuiz={(quizId) => setDisplayQuiz(quizId)}
                                                                quizAttempts={quizAttempts}
                                                            />
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => completedLec()}
                                disabled={
                                    !selectedLecture ||
                                    completingLec ||
                                    (selectedLecture && completedIds.has(selectedLecture.id)) ||
                                    (selectedLecture && !allRequiredPassed)
                                }
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-teal-500 to-teal-700 px-4 py-2.5 md:py-2 text-sm font-semibold text-white transition hover:from-teal-500 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {completingLec ? (
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                )}
                                {completingLec
                                    ? "Marking..."
                                    : selectedLecture && completedIds.has(selectedLecture.id)
                                        ? "Completed"
                                        : "Mark as completed"}
                            </button>
                            {selectedLecture && !allRequiredPassed && (
                                <p className="mt-1.5 text-xs text-red-500">Please complete the required posttest first</p>
                            )}
                        </div>
                    </main>
                )}
            </div>
        </div>
    );
}