"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Student } from "./types";
import ManageStudents from "./ManageStudents";
import {
    Users,
    UserPlus,
    AlertCircle,
    CheckCircle2,
    Loader2,
    GraduationCap,
} from "lucide-react";

export default function EnrolStudents({ classId }: { classId: string }) {
    const [students, setStudents] = useState<Student[] | undefined>(undefined);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<Student[] | []>([]);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    async function loadStudents() {
        setError(null);
        setStudentsLoading(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();

            const res = await fetch(
                "https://us-central1-rama-toxico-edu.cloudfunctions.net/getStudents",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ classId }),
                }
            );


            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message || "Failed to load students");
            }

            const data = await res.json();
            console.log(data)
            setStudents(data.students);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    }

    useEffect(() => {
        loadStudents();
    }, [classId]);

    async function addStudents() {
        console.log("adding")
        if (selectedStudents.length === 0) {
            setError("Select at least one student first.");
            return;
        }

        setEnrolling(true);
        setError(null);
        setSuccess(null);

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();

            const res = await fetch(
                "https://us-central1-rama-toxico-edu.cloudfunctions.net/enrolStudents",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        classId,
                        studentIds: selectedStudents.map((s) => s.uid),
                    }),
                }
            );

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message || "Failed to enrol students");
            }

            setSuccess(`Enrolled ${selectedStudents.length} student(s) successfully.`);
            setSelectedStudents([]);
            await loadStudents();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setEnrolling(false);
        }
    }
    const columnCount = 5;

    function initials(name?: string) {
        if (!name) return "?";
        const parts = name.trim().split(/\s+/);
        return parts
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join("");
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            {/* Enrolled students card */}
            <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                            <Users size={16} />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-gray-900">Enrolled students</h1>
                            <p className="text-xs text-gray-500">
                                {students === undefined || studentsLoading
                                    ? "Loading roster…"
                                    : `${students.length} student${students.length === 1 ? "" : "s"} enrolled`}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                                <th className="px-5 py-2.5 text-left font-medium">Student ID</th>
                                <th className="px-5 py-2.5 text-left font-medium">Full name</th>
                                <th className="px-5 py-2.5 text-left font-medium">Email</th>
                                <th className="px-5 py-2.5 text-left font-medium">Role</th>
                                <th className="px-5 py-2.5 text-left font-medium">Year</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {studentsLoading || students === undefined ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={columnCount} className="px-5 py-3">
                                            <div className="h-4 w-full max-w-md animate-pulse rounded bg-gray-100" />
                                        </td>
                                    </tr>
                                ))
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan={columnCount} className="px-5 py-10">
                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                            <GraduationCap size={22} className="text-gray-300" />
                                            <p className="text-sm font-medium text-gray-600">
                                                No students enrolled yet
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Import students from the list below to get started.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                students.map((user, idx) => (
                                    <tr
                                        key={user.uid}
                                        className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"} transition-colors hover:bg-blue-50/60`}
                                    >
                                        <td className="whitespace-nowrap px-5 py-2.5 font-mono text-xs text-gray-500">
                                            {user.rama_id}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-2.5">
                                            <div className="flex items-center gap-2.5">

                                                <span className="font-medium text-gray-800">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-2.5 text-gray-500">{user.email}</td>
                                        <td className="whitespace-nowrap px-5 py-2.5">
                                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium capitalize text-gray-600">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-2.5 text-gray-500">{user.year}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Import / enrol card */}
            <section className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                        <UserPlus size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-gray-900">Import from student list</h1>
                        <p className="text-xs text-gray-500">
                            Select students below, then enrol them into this class.
                        </p>
                    </div>
                </div>

                <div className="px-5 py-4">
                    <ManageStudents
                        setSelectedStudents={setSelectedStudents}
                        enableSelection={true}
                    />

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={() => addStudents()}
                            disabled={enrolling || selectedStudents.length === 0}
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {enrolling && <Loader2 size={14} className="animate-spin" />}
                            {enrolling
                                ? "Enrolling…"
                                : selectedStudents.length > 0
                                    ? `Enrol ${selectedStudents.length} selected student${selectedStudents.length === 1 ? "" : "s"}`
                                    : "Enrol selected students"}
                        </button>

                        {error && (
                            <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-600">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1.5 text-xs text-green-700">
                                <CheckCircle2 size={14} className="shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}