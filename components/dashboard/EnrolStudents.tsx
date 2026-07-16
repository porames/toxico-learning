"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Student } from "./types";
import ManageStudents from "./ManageStudents";

export default function EnrolStudents({ classId }: { classId: string }) {
    const [students, setStudents] = useState<Student[] | undefined>(undefined);
    const [selectedStudents, setSelectedStudents] = useState<Student[] | []>([]);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    useEffect(() => {
        async function loadStudents() {
            setError(null);
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) throw new Error("Not logged in");
                const token = await user.getIdToken();

                const res = await fetch(
                    "http://127.0.0.1:5001/rama-toxico-edu/us-central1/getStudents",
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
            }
        }
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
                "http://127.0.0.1:5001/rama-toxico-edu/us-central1/enrolStudents",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        classId,
                        studentIds: selectedStudents.map((s) => s.id),
                    }),
                }
            );

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message || "Failed to enrol students");
            }

            setSuccess(`Enrolled ${selectedStudents.length} student(s) successfully.`);
            setSelectedStudents([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setEnrolling(false);
        }
    }
    return (
        <div className="mx-auto max-w-full px-4 py-10">
            <div className="mt-4 grid grid-row gap-3">
                <h1>Enrol students</h1>
                <table className="min-w-full text-xs mb-4">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase tracking-wide">
                            <th className="px-2 py-1 text-left font-medium">Student ID</th>
                            <th className="px-2 py-1 text-left font-medium">Full Name</th>
                            <th className="px-2 py-1 text-left font-medium">Email</th>
                            <th className="px-2 py-1 text-left font-medium">Role</th>
                            <th className="px-2 py-1 text-left font-medium">Year</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                        {students === undefined ?
                            <p>Loading</p> :
                            (students.length == 0 ?
                                <p>empty</p> :
                                (students.map((user, idx) => (
                                    <tr
                                        key={user.uid}
                                        className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                                    >
                                        <td className="px-2 py-1 whitespace-nowrap font-mono">{user.rama_id}</td>
                                        <td className="px-2 py-1 whitespace-nowrap">{user.name}</td>
                                        <td className="px-2 py-1 whitespace-nowrap text-gray-500">{user.email}</td>
                                        <td className="px-2 py-1 whitespace-nowrap text-gray-500">{user.role}</td>
                                        <td className="px-2 py-1 whitespace-nowrap">{user.year}</td>
                                    </tr>
                                )))

                            )
                        }
                    </tbody>
                </table>
                <h1>Import from student list</h1>
                <div className="flex items-center gap-3 mt-2">
                    <button
                        type="button"
                        onClick={() => addStudents()}
                        disabled={enrolling || selectedStudents.length === 0}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {enrolling
                            ? "Enrolling..."
                            : `Enrol ${selectedStudents.length || ""} selected student(s)`}
                    </button>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    {success && <p className="text-xs text-green-600">{success}</p>}
                </div>
            </div>
            <ManageStudents
                setSelectedStudents={setSelectedStudents}
                enableSelection={true} />
        </div>

    )
}