"use client"

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Pencil, Play } from "lucide-react";

interface SimItem {
    id: string;
    title: string;
    age: string;
    sex: string;
    chiefComplaint: string;
    createdBy: string | null;
}

export default function SimulatorList() {
    const [sims, setSims] = useState<SimItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const snap = await getDocs(collection(db, "simulations"));
                const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SimItem));
                setSims(items);
            } catch (err) {
                console.error("Failed to load simulations:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 min-h-screen bg-canvas font-sans text-ink-500 text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-iris-600 animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
                Loading simulations…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-canvas font-sans px-8 py-10">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="text-[11px] font-mono text-iris-600 tracking-widest font-semibold">SIMULATION CASES</div>
                        <h1 className="text-2xl font-semibold text-ink-900 mt-1">All cases ({sims.length})</h1>
                    </div>
                    <Link
                        href="/simulator/new"
                        className="bg-iris-600 text-white rounded-md px-4 py-2 text-sm font-semibold no-underline hover:bg-iris-700"
                    >
                        + New case
                    </Link>
                </div>

                {sims.length === 0 && (
                    <div className="text-center py-20 text-ink-500 text-sm">
                        No simulation cases yet. Create one to get started.
                    </div>
                )}

                <div className="flex flex-col gap-2.5">
                    {sims.map((sim) => (
                        <div
                            key={sim.id}
                            className="bg-white border border-ink-900/8 rounded-lg px-5 py-4 flex items-center justify-between transition-colors hover:border-ink-900/20"
                        >
                            <Link href={`/simulator/${sim.id}`} className="no-underline flex-1">
                                <div className="text-base font-semibold text-ink-900 mb-1">
                                    {sim.title || "Untitled case"}
                                </div>
                                <div className="text-xs font-mono text-ink-500">
                                    {sim.age || "—"} y/o {sim.sex} · {sim.chiefComplaint || "no chief complaint"}
                                </div>
                            </Link>
                            <div className="flex gap-1.5">
                                <Link
                                    href={`/simulator/${sim.id}`}
                                    className="flex items-center justify-center w-9 h-9 rounded-md border border-ink-900/8 text-ink-500 hover:bg-iris-50 hover:text-iris-600"
                                >
                                    <Pencil size={16} />
                                </Link>
                                <Link
                                    href={`/simulator/play/${sim.id}`}
                                    className="flex items-center justify-center w-9 h-9 rounded-md border border-ink-900/8 text-ink-500 hover:bg-iris-50 hover:text-iris-600"
                                >
                                    <Play size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
