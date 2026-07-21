"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  Pencil,
  Check,
  PlusCircle,
  Trash2,
  Upload,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import Papa from "papaparse";
import type { Student } from "./types";

const ROLE_LABELS: Record<string, string> = {
    student: "นศพ.",
    resident: "Resident",
    teacher: "อาจารย์",
    admin: "Admin",
};

const YEAR_LABELS: Record<string, string> = {
    y4: "ปี 4",
    y5: "ปี 5",
    y6: "ปี 6",
    r1: "R1",
    r2: "R2",
    r3: "R3",
};

const YEAR_OPTIONS: Record<string, { value: string; label: string }[]> = {
    student: [
        { value: "y4", label: "ปี 4" },
        { value: "y5", label: "ปี 5" },
        { value: "y6", label: "ปี 6" },
    ],
    resident: [
        { value: "r1", label: "R1" },
        { value: "r2", label: "R2" },
        { value: "r3", label: "R3" },
    ],
};

function AddStudentRow({
    bgColor,
    onStudentAdded,
    enableSelection
}: {
    bgColor: string;
    onStudentAdded: () => void;
    enableSelection: boolean
}) {
    const [userId, setUserId] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [year, setYear] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function resetForm() {
        setUserId("");
        setFullName("");
        setEmail("");
        setRole("");
        setYear("");
    }

    async function handleSubmit() {
        setError(null);

        const needsYear = role === "student" || role === "resident";
        if (!userId || !fullName || !email || !role || (needsYear && !year)) {
            setError("Please fill in every field before adding a student.");
            return;
        }

        setSubmitting(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error("Not logged in");
            }
            const token = await user.getIdToken();

            const res = await fetch(
                "https://us-central1-rama-toxico-edu.cloudfunctions.net/createUser",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        email,
                        name: fullName,
                        year,
                        role,
                        rama_id: userId,
                    }),
                }
            );

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message || "Failed to add student");
            }

            resetForm();
            onStudentAdded();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <tr className={bgColor}>
                {enableSelection && <td />}
                <td className="px-3 py-1">
                    <input
                        type="text"
                        value={userId}
                        placeholder="รหัสนักศึกษา"
                        onChange={(e) => setUserId(e.target.value)}
                        className="h-8 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-iris-500 focus:outline-none focus:ring-1 focus:ring-iris-500"
                    />
                </td>
                <td className="px-3 py-1">
                    <input
                        type="text"
                        placeholder="ชื่อ สกุล"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-8 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-iris-500 focus:outline-none focus:ring-1 focus:ring-iris-500"
                    />
                </td>
                <td className="px-3 py-1">
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-8 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-iris-500 focus:outline-none focus:ring-1 focus:ring-iris-500"
                    />
                </td>
                <td className="px-3 py-1">
                    <select
                        value={role}
                        onChange={(e) => {
                            const newRole = e.target.value;
                            setRole(newRole);
                            const validYears = YEAR_OPTIONS[newRole]?.map((o) => o.value) ?? [];
                            if (!validYears.includes(year)) setYear("");
                        }}
                        className="h-8 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-iris-500 focus:outline-none focus:ring-1 focus:ring-iris-500"
                    >
                        <option value="" disabled hidden>
                            Select role
                        </option>
                        <option value="student">นศพ.</option>
                        <option value="resident">Resident</option>
                        <option value="teacher">อาจารย์</option>
                        <option value="admin">Admin</option>
                    </select>
                </td>
                <td className="px-3 py-1 whitespace-nowrap">
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="h-8 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-iris-500 focus:outline-none focus:ring-1 focus:ring-iris-500"
                    >
                        {role === "student" || role === "resident" ? (
                            <>
                                <option value="" disabled hidden>
                                    {role === "resident" ? "Residency year" : "ชั้นปี"}
                                </option>
                                {(YEAR_OPTIONS[role] ?? []).map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </>
                        ) : (
                            <option value="">—</option>
                        )}
                    </select>
                </td>
                <td className="px-3 py-1 whitespace-nowrap">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 rounded-md bg-iris-600 px-2.5 py-1 text-[12px] font-semibold text-white transition hover:bg-iris-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Adding…
                            </>
                        ) : (
                            <>
                                <PlusCircle size={14} /> Add
                            </>
                        )}
                    </button>
                </td>
            </tr>
        </>
    );
}

function EditableStudentRow({
    student,
    bgColor,
    onUpdated,
    onDeleted,
    setSelectedStudents,
    enableSelection
}: {
    student: Student;
    bgColor: string;
    onUpdated: () => void;
    onDeleted: (id: string) => void;
    setSelectedStudents?: React.Dispatch<React.SetStateAction<Student[]>>;
    enableSelection: boolean

}) {
    const [isEditing, setIsEditing] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [ramaId, setRamaId] = useState(student.rama_id);
    const [name, setName] = useState(student.name);
    const [email, setEmail] = useState(student.email);
    const [role, setRole] = useState(student.role);
    const [year, setYear] = useState(student.year);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);

    function cancelEdit() {
        setRamaId(student.rama_id);
        setName(student.name);
        setEmail(student.email);
        setRole(student.role);
        setYear(student.year);
        setError(null);
        setIsEditing(false);
    }

    async function handleSave() {
        if (!ramaId || !name || !email || !role || !year) {
            setError("All fields are required.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await updateDoc(doc(db, "users", student.uid), {
                rama_id: ramaId,
                name,
                email,
                role,
                year,
            });
            setIsEditing(false);
            onUpdated();
        } catch (err) {
            setError("Couldn't save changes. Try again.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    }
    function handleStudentSelection(selection: Student, checked: boolean) {
        if (setSelectedStudents) {
            if (checked === false) {
                console.log("add to list")
                setSelectedStudents(prev => [...prev, selection]);
                setChecked(true);
            } else {
                    setSelectedStudents(prev => prev.filter(student => student.uid !== selection.uid));
                setChecked(false);
            }
        }

    }
    async function handleDelete() {
        setDeleting(true);
        setError(null);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error("Not logged in");
            }
            const token = await user.getIdToken();

            const res = await fetch(
                "https://us-central1-rama-toxico-edu.cloudfunctions.net/deleteUser",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ uid: student.uid }),
                }
            );

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message || "Failed to delete student");
            }

            onDeleted(student.uid);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setConfirmingDelete(false);
        } finally {
            setDeleting(false);
        }
    }

    if (isEditing) {
        return (
            <tr className={bgColor}>
                {enableSelection && <td />}
                <td className="px-3 py-1">
                    <input
                        value={ramaId}
                        onChange={(e) => setRamaId(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-iris-500 focus:outline-none focus:ring-1 focus:ring-iris-500"
                    />
                </td>
                <td className="px-3 py-1">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-iris-500 focus:outline-none focus:ring-1 focus:ring-iris-500"
                    />
                </td>
                <td className="px-3 py-1">
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-iris-500 focus:outline-none focus:ring-1 focus:ring-iris-500"
                    />
                </td>
                <td className="px-3 py-1">
                    <select
                        value={role}
                        onChange={(e) => {
                            const newRole = e.target.value;
                            setRole(newRole);
                            const validYears = YEAR_OPTIONS[newRole]?.map((o) => o.value) ?? [];
                            if (!validYears.includes(year)) setYear("");
                        }}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-iris-500 focus:outline-none focus:ring-1 focus:ring-iris-500"
                    >
                        <option value="student">นศพ.</option>
                        <option value="resident">Resident</option>
                        <option value="teacher">อาจารย์</option>
                        <option value="admin">Admin</option>
                    </select>
                </td>
                <td className="px-3 py-1">
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-iris-500 focus:outline-none focus:ring-1 focus:ring-iris-500"
                    >
                        {role !== "student" && role !== "resident" ? (
                            <option value="">—</option>
                        ) : (
                            (YEAR_OPTIONS[role] ?? []).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))
                        )}
                    </select>
                </td>
                <td className="px-3 py-1 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-md bg-iris-600 px-2.5 py-1 text-[12px] font-semibold text-white transition hover:bg-iris-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={saving}
                            className="rounded-md border border-gray-300 px-2.5 py-1 text-[12px] font-medium text-gray-600 transition hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                    {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
                </td>
            </tr>
        );
    }

    return (
        <tr className={`${bgColor} transition-colors hover:bg-blue-50`}>
            {enableSelection &&
                <td className="px-3 py-1 whitespace-nowrap font-mono">
                    <button
                        type="button"
                        onClick={() => handleStudentSelection(student, checked)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        {checked && <Check size={14} className="text-white" />}
                    </button>
                </td>
            }
            <td className="px-3 py-1 whitespace-nowrap font-mono">{student.rama_id}</td>
            <td className="px-3 py-1 whitespace-nowrap">{student.name}</td>
            <td className="px-3 py-1 whitespace-nowrap text-gray-500">{student.email}</td>
            <td className="px-3 py-1 whitespace-nowrap text-gray-500">
                {ROLE_LABELS[student.role ?? ""] ?? student.role}
            </td>
            <td className="px-3 py-1 whitespace-nowrap">
                {YEAR_LABELS[student.year] ?? student.year}
            </td>
            <td className="px-3 py-1 whitespace-nowrap">
                {confirmingDelete ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-500">Delete?</span>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="rounded-md bg-red-600 px-2.5 py-1 text-[12px] font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {deleting ? "Deleting..." : "Confirm"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmingDelete(false)}
                            disabled={deleting}
                            className="rounded-md border border-gray-300 px-2.5 py-1 text-[12px] font-medium text-gray-600 transition hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 my-1">
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                        >
                            <Pencil size={16} className="text-gray-600" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmingDelete(true)}
                        >
                            <Trash2 size={16} className="ml-3 text-red-600" />
                        </button>
                    </div>
                )}
                {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
            </td>
        </tr>
    );
}

export default function ManageStudents({
    enableSelection,
    setSelectedStudents
}: {
    enableSelection: boolean;
    setSelectedStudents?: React.Dispatch<React.SetStateAction<Student[]>>;
}) {
    const [students, setStudents] = useState<Student[] | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const [csvExpanded, setCsvExpanded] = useState(false);
    const [csvData, setCsvData] = useState<
        { rama_id: string; name: string; email: string; role: string; year: string }[] | null
    >(null);
    const [csvParsing, setCsvParsing] = useState(false);
    const [csvError, setCsvError] = useState<string | null>(null);
    const [csvUploading, setCsvUploading] = useState(false);
    const [csvSuccess, setCsvSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setCsvError(null);
        setCsvSuccess(null);
        setCsvData(null);
        setCsvParsing(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            type CsvRow = {
                rama_id: string;
                name: string;
                email: string;
                role: string;
                year: string;
            };

            const result = Papa.parse<CsvRow>(text, {
                header: true,
                skipEmptyLines: true,
            });

            if (result.errors.length > 0) {
                setCsvError(`CSV error: ${result.errors[0].message}`);
                setCsvParsing(false);
                return;
            }

            const headers = result.meta.fields ?? [];
            const required: (keyof CsvRow)[] = ["rama_id", "name", "email", "role", "year"];
            const missing = required.filter((h) => !headers.includes(h));
            if (missing.length > 0) {
                setCsvError(`Missing columns in CSV: ${missing.join(", ")}`);
                setCsvParsing(false);
                return;
            }

            const rows = result.data.filter(
                (r) => r.rama_id || r.name || r.email,
            );
            if (rows.length === 0) {
                setCsvError("CSV file contains no data rows.");
                setCsvParsing(false);
                return;
            }

            setCsvData(rows);
            setCsvParsing(false);
        };
        reader.onerror = () => {
            setCsvError("Failed to read file.");
            setCsvParsing(false);
        };
        reader.readAsText(file);
    }

    function resetCsv() {
        setCsvData(null);
        setCsvError(null);
        setCsvSuccess(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function handleCsvUpload() {
        if (!csvData || csvData.length === 0) return;
        setCsvUploading(true);
        setCsvError(null);
        setCsvSuccess(null);

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error("Not logged in");
            const token = await user.getIdToken();

            const res = await fetch(
                "https://us-central1-rama-toxico-edu.cloudfunctions.net/createUsers",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({students: csvData}),
                },
            );

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error || "Failed to create users");
            }

            const data = await res.json();
            setCsvSuccess(`Successfully created ${data.count} student(s).`);
            resetCsv();
            setCsvExpanded(false);
            await loadUsers();
        } catch (err) {
            setCsvError(
                err instanceof Error ? err.message : "Something went wrong",
            );
        } finally {
            setCsvUploading(false);
        }
    }

    async function loadUsers() {
        try {
            setError(null);
            const snapshot = await getDocs(collection(db, "users"));
            const loaded = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    uid: doc.id,
                    rama_id: data.rama_id,
                    name: data.name,
                    email: data.email,
                    role: data.role ?? "",
                    year: data.year ?? "",
                } as Student;
            });
            setStudents(loaded);
        } catch (err) {
            setError("Couldn't load students. Try refreshing the page.");
            console.error(err);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    function handleDeleted(id: string) {
        setStudents((prev) => prev?.filter((s) => s.uid !== id));
    }

    const isLoading = students === undefined;
    const isEmpty = students !== undefined && students.length === 0;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">

                {!isLoading && (
                    <span className="text-xs text-gray-400">
                        {students!.length} {students!.length === 1 ? "student" : "students"}
                    </span>
                )}
            </div>

            <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <button
                    type="button"
                    onClick={() => setCsvExpanded(!csvExpanded)}
                    className="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                    <span className="flex items-center gap-2">
                        <Upload size={14} />
                        Import from CSV
                    </span>
                    {csvExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {csvExpanded && (
                    <div className="border-t border-gray-200 px-4 pb-4 pt-3">
                        {!csvData ? (
                            <>
                                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-5 text-center">
                                    <Upload size={20} className="text-gray-400" />
                                    <p className="mt-2 text-xs text-gray-600">
                                        Upload a CSV file with student data
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-gray-400">
                                        Expected columns: rama_id, name, email, role, year
                                    </p>
                                    <label className="mt-3 cursor-pointer rounded-md bg-iris-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-iris-700">
                                        Choose CSV file
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv"
                                            onChange={handleCsvFile}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {csvParsing && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-iris-600/30 border-t-iris-600" />
                                        Parsing file…
                                    </div>
                                )}

                                {csvError && (
                                    <div className="mt-2 rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-700">
                                        {csvError}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-700">
                                        {csvData.length} student{csvData.length === 1 ? "" : "s"} found
                                    </span>
                                    <button
                                        type="button"
                                        onClick={resetCsv}
                                        className="rounded p-0.5 text-gray-400 transition hover:text-gray-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                <div className="max-h-56 overflow-y-auto rounded-md border border-gray-200">
                                    <table className="min-w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-100 uppercase tracking-wide text-gray-600">
                                                <th className="px-3 py-1.5 text-left font-medium">Student ID</th>
                                                <th className="px-3 py-1.5 text-left font-medium">Full name</th>
                                                <th className="px-3 py-1.5 text-left font-medium">Email</th>
                                                <th className="px-3 py-1.5 text-left font-medium">Role</th>
                                                <th className="px-3 py-1.5 text-left font-medium">Year</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-gray-800">
                                            {csvData.map((row, i) => (
                                                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                    <td className="whitespace-nowrap px-3 py-1 font-mono">{row.rama_id}</td>
                                                    <td className="whitespace-nowrap px-3 py-1">{row.name}</td>
                                                    <td className="whitespace-nowrap px-3 py-1 text-gray-500">{row.email}</td>
                                                    <td className="whitespace-nowrap px-3 py-1 text-gray-500">{row.role}</td>
                                                    <td className="whitespace-nowrap px-3 py-1 text-gray-500">{row.year}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-3 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCsvUpload}
                                        disabled={csvUploading}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-iris-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-iris-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {csvUploading && (
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        )}
                                        {csvUploading
                                            ? "Uploading…"
                                            : `Upload ${csvData.length} student${csvData.length === 1 ? "" : "s"}`}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetCsv}
                                        disabled={csvUploading}
                                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {csvError && (
                                    <div className="mt-2 rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-700">
                                        {csvError}
                                    </div>
                                )}
                                {csvSuccess && (
                                    <div className="mt-2 rounded-md bg-green-50 px-3 py-1.5 text-xs text-green-700">
                                        {csvSuccess}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-3 rounded-md bg-red-50 px-3 py-1 text-xs text-red-700">
                    {error}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-100 uppercase tracking-wide text-gray-600">
                            {enableSelection && <th style={{ width: 32 }} className="px-3 py-1 text-left font-medium"></th>}
                            <th className="px-3 py-1 text-left font-medium">Student ID</th>
                            <th className="px-3 py-1 text-left font-medium">Full name</th>
                            <th className="px-3 py-1 text-left font-medium">Email</th>
                            <th className="px-3 py-1 text-left font-medium">Role</th>
                            <th className="px-3 py-1 text-left font-medium">Year</th>
                            <th className="px-3 py-1 text-left font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                        {isLoading &&
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={`skeleton-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <td key={j} className="px-3 py-1.5">
                                            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                                        </td>
                                    ))}
                                </tr>
                            ))}

                        {isEmpty && (
                            <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                                    No students yet. Add one below to get started.
                                </td>
                            </tr>
                        )}
                        {!isLoading && (
                            enableSelection ? (
                                students!.map((student, idx) => (
                                    <EditableStudentRow
                                        key={student.uid}
                                        student={student}
                                        bgColor={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                        onUpdated={loadUsers}
                                        onDeleted={handleDeleted}
                                        setSelectedStudents={setSelectedStudents}
                                        enableSelection={true}
                                    />
                                ))
                            ) : (
                                students!.map((student, idx) => (
                                    <EditableStudentRow
                                        key={student.uid}
                                        student={student}
                                        bgColor={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                        onUpdated={loadUsers}
                                        onDeleted={handleDeleted}
                                        enableSelection={false}
                                    />
                                ))
                            )
                        )}

                        {!isLoading && (
                            <AddStudentRow
                                enableSelection={enableSelection}
                                bgColor={`${students!.length % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    }`}
                                onStudentAdded={loadUsers}
                            />
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}