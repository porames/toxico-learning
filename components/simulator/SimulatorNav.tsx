"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Play } from "lucide-react";

interface SimulatorNavProps {
    caseId: string;
    sidebarOpen?: boolean;
    onToggleSidebar?: () => void;
    hidePlay?: boolean;
}

export default function SimulatorNav({ caseId, sidebarOpen = false, onToggleSidebar, hidePlay }: SimulatorNavProps) {
    const [title, setTitle] = useState<string | null>(null);
    const isNew = caseId === "new";

    useEffect(() => {
        if (isNew) return;
        (async () => {
            try {
                const snap = await getDoc(doc(db, "simulations", caseId));
                if (snap.exists()) {
                    setTitle(snap.data().title || null);
                }
            } catch {
                // ignore
            }
        })();
    }, [caseId, isNew]);

    return (
        <nav className="flex h-12 items-center justify-between border-b border-ink-900/8 bg-white px-6">
            <div className="flex items-center gap-2">
                <button
                    className="sidebar-mobile"
                    onClick={onToggleSidebar}
                    style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        padding: 8,
                        color: "currentColor",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {sidebarOpen ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    )}
                </button>
                <span className="flex items-center gap-1.5 text-sm">
                    <Link
                        href="/simulator"
                        className="text-ink-900/60 no-underline hover:text-iris-600 transition-colors"
                    >
                        Simulator
                    </Link>
                    {title && (
                        <>
                            <span className="text-ink-900/20">›</span>
                            <span className="text-ink-900">{title}</span>
                        </>
                    )}
                    {isNew && (
                        <>
                            <span className="text-ink-900/20">›</span>
                            <span className="text-ink-900/60">New case</span>
                        </>
                    )}
                </span>
            </div>

            {!isNew && !hidePlay && (
                <Link
                    href={`/simulator/play/${caseId}`}
                    className="flex items-center gap-1.5 rounded-md bg-iris-600 px-3 py-1.5 text-xs font-semibold text-white no-underline hover:bg-iris-700 transition-colors"
                >
                    <Play size={14} />
                    Play
                </Link>
            )}
        </nav>
    );
}
