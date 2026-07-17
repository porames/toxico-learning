"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Activity, Stethoscope, FlaskConical, Pill, Heart, Bone, FileText, AlertTriangle, Clock } from "lucide-react";
import type { CaseData, VitalSign } from "./types";
import { VITAL_DEFS } from "./database";
import { GameCanvas } from "./GameCanvas";
import { VitalsPanel } from "./VitalsPanel";
import { ExamPanel } from "./ExamPanel";
import { InvestigationsPanel } from "./InvestigationsPanel";
import { ImagingPanel } from "./ImagingPanel";
import { HistoryPanel } from "./HistoryPanel";
import { ManagementPanel } from "./ManagementPanel";

type ActionTab = "vitals" | "history" | "exam" | "investigations" | "imaging" | "management";

const TABS: { key: ActionTab; label: string; icon: typeof Heart }[] = [
    { key: "vitals", label: "Vital Signs", icon: Activity },
    { key: "history", label: "History", icon: FileText },
    { key: "exam", label: "Physical Exam", icon: Stethoscope },
    { key: "investigations", label: "Investigations", icon: FlaskConical },
    { key: "imaging", label: "Imaging", icon: Bone },
    { key: "management", label: "Management", icon: Pill },
];

/* ------------------------------------------------------------------ */
/*  Game state                                                          */
/* ------------------------------------------------------------------ */

const GAME_DURATION_MINUTES = 30;

/* ------------------------------------------------------------------ */
/*  Main PlayCase component                                            */
/* ------------------------------------------------------------------ */

export default function PlayCase({ caseId }: { caseId: string }) {
    const [caseData, setCaseData] = useState<CaseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Game state
    const [activeTab, setActiveTab] = useState<ActionTab>("vitals");
    const [vitalsRequested, setVitalsRequested] = useState(false);
    const [examinedSystems, setExaminedSystems] = useState<Set<string>>(new Set());
    const [requestedTests, setRequestedTests] = useState<Set<string>>(new Set());
    const [selectedInterventions, setSelectedInterventions] = useState<Set<string>>(new Set());
    const [minutes, setMinutes] = useState(GAME_DURATION_MINUTES);
    const [seconds, setSeconds] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    // Timer
    useEffect(() => {
        if (!gameStarted || gameOver) return;
        const interval = setInterval(() => {
            setElapsed((e) => e + 1);
            setSeconds((s) => {
                if (s === 0) {
                    setMinutes((m) => {
                        if (m === 0) {
                            setGameOver(true);
                            return 0;
                        }
                        return m - 1;
                    });
                    return 59;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [gameStarted, gameOver]);

    // Fetch
    useEffect(() => {
        (async () => {
            try {
                const snap = await getDoc(doc(db, "simulations", caseId));
                if (snap.exists()) {
                    setCaseData(snap.data() as CaseData);
                } else {
                    setError("Case not found.");
                }
            } catch {
                setError("Failed to load case.");
            } finally {
                setLoading(false);
            }
        })();
    }, [caseId]);

    const startGame = useCallback(() => setGameStarted(true), []);

    const requestVitals = useCallback(() => setVitalsRequested(true), []);

    const requestExam = useCallback((sys: string) => {
        setExaminedSystems((prev) => new Set(prev).add(sys));
    }, []);

    const requestBundle = useCallback((testNames: string[], cost: number) => {
        setRequestedTests((prev) => {
            const next = new Set(prev);
            testNames.forEach((n) => next.add(n));
            return next;
        });
        const total = minutes * 60 + seconds - cost;
        if (total <= 0) {
            setGameOver(true);
            setMinutes(0);
            setSeconds(0);
        } else {
            setMinutes(Math.floor(total / 60));
            setSeconds(total % 60);
        }
    }, [minutes, seconds]);

    const applyIntervention = useCallback((name: string) => {
        setSelectedInterventions((prev) => new Set(prev).add(name));
    }, []);

    const vitalRandCache = useRef<Map<string, string>>(new Map()).current;

    const resolvedVitals = useMemo(() => {
        const raw = caseData?.vitals || {};
        const out: Record<string, VitalSign> = {};
        for (const def of VITAL_DEFS) {
            const existing = raw[def.key];
            if (existing && existing.value) {
                out[def.key] = existing;
            } else {
                let cached = vitalRandCache.get(def.key);
                if (!cached) {
                    const [lo, hi] = def.normal;
                    const isInt = def.key === "hr" || def.key === "sbp" || def.key === "dbp" || def.key === "rr" || def.key === "spo2" || def.key === "gcs";
                    cached = isInt ? String(Math.round(lo + Math.random() * (hi - lo))) : (lo + Math.random() * (hi - lo)).toFixed(1);
                    vitalRandCache.set(def.key, cached);
                }
                const existingAbnormal = existing?.abnormal ?? false;
                out[def.key] = { value: cached, abnormal: existingAbnormal };
            }
        }
        return out;
    }, [caseData?.vitals, vitalRandCache]);

    // Loading
    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 min-h-screen bg-canvas font-sans text-ink-500 text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-iris-600 animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
                Loading case…
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-canvas font-sans">
                <div className="text-center">
                    <AlertTriangle size={32} className="text-ink-400 mx-auto mb-3" />
                    <p className="text-sm text-ink-500">{error || "Could not load case."}</p>
                </div>
            </div>
        );
    }

    // Start screen
    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-canvas font-sans flex items-center justify-center">
                <div className="max-w-md text-center">
                    <Heart size={48} className="text-iris-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-semibold text-ink-900 mb-1">{caseData.title || "Untitled case"}</h1>
                    <p className="text-sm text-ink-500 mb-1">
                        {caseData.age || "—"} y/o {caseData.sex} · {caseData.chiefComplaint || "No chief complaint"}
                    </p>
                    <p className="text-xs text-ink-400 mb-6 leading-relaxed">
                        {caseData.background ? caseData.background.slice(0, 200) + (caseData.background.length > 200 ? "…" : "") : ""}
                    </p>
                    <button
                        onClick={startGame}
                        className="rounded-lg bg-iris-600 px-6 py-3 text-sm font-semibold text-white hover:bg-iris-700 transition-colors cursor-pointer"
                    >
                        Start Simulation
                    </button>
                </div>
            </div>
        );
    }

    const gameTimeUp = gameOver || (minutes === 0 && seconds === 0);

    return (
        <div className="relative min-h-screen bg-canvas font-sans">
            {/* Full-screen 3D scene */}
            <div className="fixed inset-0">
                <GameCanvas
                    vitals={resolvedVitals}
                    vitalsVisible={vitalsRequested}
                    elapsed={elapsed}
                    minutes={gameTimeUp ? 0 : minutes}
                    seconds={gameTimeUp ? 0 : seconds}
                    gameOver={gameTimeUp}
                />
            </div>

            {/* Elapsed timer — always visible */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                    <Clock size={14} />
                    {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
                </span>
                {gameTimeUp && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 bg-rose-100/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                        Time is up!
                    </span>
                )}
            </div>
            {/* Active panel content */}
            <div className="fixed bottom-6 left-6 z-10 flex flex-col gap-2 max-w-[420px] max-h-[55vh] overflow-y-auto bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-ink-900/8 p-4">
                {activeTab === "vitals" && (
                    <VitalsPanel
                        vitals={resolvedVitals}
                        requested={vitalsRequested}
                        onRequest={requestVitals}
                    />
                )}
                {activeTab === "history" && (
                    <HistoryPanel data={caseData} />
                )}
                {activeTab === "exam" && (
                    <ExamPanel
                        findings={caseData.exam}
                        onRequest={requestExam}
                        requestedSystems={examinedSystems}
                    />
                )}
                {activeTab === "investigations" && (
                    <InvestigationsPanel
                        caseInvestigations={caseData.investigations}
                        requestedTests={requestedTests}
                        onRequestBundle={requestBundle}
                    />
                )}
                {activeTab === "imaging" && (
                    <ImagingPanel
                        caseInvestigations={caseData.investigations}
                        requestedTests={requestedTests}
                        onRequestBundle={requestBundle}
                    />
                )}
                {activeTab === "management" && (
                    <ManagementPanel
                        selectedInterventions={selectedInterventions}
                        onSelectIntervention={applyIntervention}
                    />
                )}
            </div>
            {/* Floating action panel — bottom-right */}
            <div className="fixed bottom-6 right-6 z-10 flex flex-col gap-2 max-w-[420px]">
                {/* Tab buttons */}
                <div className="flex flex-col gap-3 bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-ink-900/8">
                    {TABS.map((t) => {
                        const Icon = t.icon;
                        const isActive = activeTab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                disabled={gameTimeUp && t.key !== "management"}
                                className={`flex items-center gap-1.5 px-3 py-2 text-md font-semibold rounded-lg transition-colors cursor-pointer ${isActive
                                    ? "bg-iris-100 text-iris-700"
                                    : "text-ink-500 hover:bg-iris-50 hover:text-iris-600"
                                    } ${gameTimeUp && t.key !== "management" ? "opacity-40 cursor-default" : ""}`}
                            >
                                <Icon size={15} />
                                <span>{t.label}</span>
                            </button>
                        );
                    })}
                </div>


            </div>
        </div>
    );
}
