"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Activity, Stethoscope, FlaskConical, Pill, Heart, Bone, FileText, AlertTriangle, Clock, Syringe, Play } from "lucide-react";
import type { CaseData, VitalSign, PlayerEvent, OutcomeNodeData, Investigation, ManagementNode } from "./types";
import { VITAL_DEFS, DISEASES_DB } from "./database";
import { Modal } from "./ui";
import { GameCanvas } from "./GameCanvas";
import { VitalsPanel } from "./VitalsPanel";
import { ExamPanel } from "./ExamPanel";
import { InvestigationsPanel } from "./InvestigationsPanel";
import { ImagingPanel } from "./ImagingPanel";
import { HistoryPanel } from "./HistoryPanel";
import { ManagementPanel } from "./ManagementPanel";
import { getOutgoingNodes, isInterventionRequired } from "./utils";
import { NodeUserData } from "three/webgpu";

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
const TOTAL_GAME_SECONDS = GAME_DURATION_MINUTES * 60;

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
    const [selectedDoses, setSelectedDoses] = useState<Record<string, string>>({});
    const [requiredActions, setRequiredActions] = useState<string[][] | null>(null);
    const [requiredDoseMap, setRequiredDoseMap] = useState<Record<string, string> | null>(null);
    const [imagingResult, setImagingResult] = useState<Investigation | null>(null);
    const [outcomeModal, setOutcomeModal] = useState<OutcomeNodeData | null>(null);
    const [gameOverReason, setGameOverReason] = useState<{ event: "won" | "patientDied" | "timeOut", description: string } | null>(null);
    const [minutes, setMinutes] = useState(GAME_DURATION_MINUTES);
    const [seconds, setSeconds] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [playerEvents, setPlayerEvents] = useState<PlayerEvent[]>([]);
    const [health, setHealth] = useState(100);
    const [diagnosisInput, setDiagnosisInput] = useState("");
    const [activeIdx, setActiveIdx] = useState(-1);
    const [diagnosisResult, setDiagnosisResult] = useState<"correct" | "wrong" | null>(null);
    const [currentNode, setCurrentNode] = useState<ManagementNode | null>(null);
    const [unlockedDispositions, setUnlockedDispositions] = useState<string[]>([]);
    const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
    const elapsedRef = useRef(elapsed);
    elapsedRef.current = elapsed;

    const recordEvent = useCallback((event: PlayerEvent) => {
        setPlayerEvents((prev) => [...prev, event]);
    }, []);

    // Timer
    useEffect(() => {
        if (!gameStarted || gameOver) return;
        const interval = setInterval(() => {
            setElapsed((e) => e + 1);
            setHealth((h) => Math.max(0, h - 100 / TOTAL_GAME_SECONDS));
            setSeconds((s) => {
                if (s === 0) {
                    setMinutes((m) => {
                        if (m === 0) {
                            setGameOver(true);
                            setGameOverReason({ event: "timeOut", description: "Time has expired." });
                            recordEvent({ kind: "game_over", timestamp: elapsedRef.current, reason: "time_expired" });
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
    }, [gameStarted, gameOver, recordEvent]);

    // Health reaches 0 → game over
    useEffect(() => {
        if (!gameStarted || gameOver || health > 0) return;
        setGameOver(true);
        setGameOverReason({ event: "patientDied", description: "Patient's health has reached zero." });
        recordEvent({ kind: "game_over", timestamp: elapsed, reason: "health_depleted" });
    }, [health, gameStarted, gameOver, elapsed, recordEvent]);

    // Fetch
    useEffect(() => {
        (async () => {
            try {
                const snap = await getDoc(doc(db, "simulations", caseId));
                if (snap.exists()) {
                    setCaseData(snap.data() as CaseData);
                    console.log(snap.data())
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

    const startGame = useCallback(() => {
        setGameStarted(true);
        setHealth(100);
        recordEvent({ kind: "game_start", timestamp: elapsed });
    }, [recordEvent, elapsed]);

    const requestVitals = useCallback(() => {
        setVitalsRequested(true);
        recordEvent({ kind: "vitals_requested", timestamp: elapsed });
    }, [recordEvent, elapsed]);

    const requestExam = useCallback((sys: string) => {
        setExaminedSystems((prev) => new Set(prev).add(sys));
        recordEvent({ kind: "exam_performed", timestamp: elapsed, system: sys });
    }, [recordEvent, elapsed]);

    const requestBundle = useCallback((testNames: string[], cost: number, bundleName?: string) => {
        setRequestedTests((prev) => {
            const next = new Set(prev);
            testNames.forEach((n) => next.add(n));
            return next;
        });
        recordEvent({ kind: "test_ordered", timestamp: elapsed, name: bundleName ?? testNames[0] });
        setElapsed((e) => e + cost);
        setHealth((h) => Math.max(0, h - (cost / TOTAL_GAME_SECONDS) * 100));
        const total = minutes * 60 + seconds - cost;
        if (total <= 0) {
            setGameOver(true);
            setGameOverReason({ event: "timeOut", description: "Time has expired." });
            setMinutes(0);
            setSeconds(0);
        } else {
            setMinutes(Math.floor(total / 60));
            setSeconds(total % 60);
        }
    }, [minutes, seconds, recordEvent, elapsed]);

    const applyIntervention = useCallback((name: string, dose?: string) => {
        const nextSelected = new Set(selectedInterventions);
        nextSelected.add(name);
        setSelectedInterventions(nextSelected);

        if (dose) {
            setSelectedDoses((prev) => ({ ...prev, [name]: dose }));
        }

        recordEvent({ kind: "intervention_applied", timestamp: elapsed, name, dose });

        if (requiredActions) {
            const allFulfilled = requiredActions.every((group) =>
                group.some((action) => nextSelected.has(action))
            );
            if (allFulfilled) {
                setGameOver(true);
                setGameOverReason({ event: "won", description: "All required interventions completed." });
                recordEvent({ kind: "game_over", timestamp: elapsed, reason: "all_required_done" });
            }
        }

        const isRequired = requiredActions?.some((group) => group.includes(name));
        const requiredDoseOk = !isRequired || !requiredDoseMap?.[name] || requiredDoseMap[name] === dose;

        if (isRequired && requiredDoseOk) {
            const rewardNarrative = `"${name}" is the correct intervention. The patient is responding well.`;
            const rewardData: OutcomeNodeData = {
                outcomeType: "improved",
                narrative: rewardNarrative,
                newSymptoms: "",
                vitalChanges: {},
            };
            setOutcomeModal(rewardData);
            recordEvent({ kind: "outcome", timestamp: elapsed, outcomeType: "improved" });
            setHealth((h) => Math.min(100, h + 25));
        }

        if (caseData) {
            const graph = caseData.managementGraph;
            const startNode = graph.nodes.find(n => n.type === "start");

            if (startNode) {
                let outgoing: ManagementNode[];
                if (currentNode === null) {
                    outgoing = getOutgoingNodes(graph, startNode.id);
                }
                else {
                    console.log("currentNode", currentNode)
                    outgoing = getOutgoingNodes(graph, currentNode.id);
                }
                // no currentNode set, starting node it is
                const doseMatched = outgoing.find((n) =>
                    n.type === "intervention" &&
                    (n.data as any).actions?.includes(name) &&
                    (!(n.data as any).doseMap?.[name] || (n.data as any).doseMap[name] === dose)
                );

                const requiredNode = outgoing.find(n => n.type === "required");
                if (requiredNode) {
                    console.log("requiredNode unlocked", requiredNode);
                    setRequiredActions((requiredNode.data as any).actions.map((g: any) => g.or ?? g));
                    setRequiredDoseMap((requiredNode.data as any).doseMap ?? null);
                }
                // correct dose + intervention
                if (doseMatched) {
                    const outcomeNode = getOutgoingNodes(graph, doseMatched.id).find(n => n.type === "outcome");
                    // user gave intervention with outcome -> continue
                    if (outcomeNode) {
                        setCurrentNode(outcomeNode);
                        console.log(outcomeNode);
                        const data = outcomeNode.data;
                        const outcomeType = data.outcomeType;
                        setOutcomeModal(data);
                        recordEvent({ kind: "outcome", timestamp: elapsed, outcomeType: data.outcomeType });
                        if (outcomeType !== "unlockEvent") {
                            if (outcomeType === "deteriorated") {
                                setHealth(health - 30);
                            }
                            else if (outcomeType === "critical") {
                                setHealth(health - 70);
                            }
                            else if (outcomeType === "improved") {
                                if (health + 10 < 100) {
                                    setHealth(health + 10);
                                }
                                else {
                                    setHealth(100)
                                }
                            }
                            setCaseData((prev) => {
                                if (!prev) return prev;
                                const merged = { ...prev.vitals };
                                for (const [key, val] of Object.entries(data.vitalChanges)) {
                                    if (val) {
                                        merged[key] = { value: val as string, abnormal: true };
                                    }
                                }
                                return { ...prev, vitals: merged };
                            });
                        } else {
                            setUnlockedDispositions((data as any).unlockedDispositions ?? []);
                        }
                        }
                    } else {
                    // wrong dose or drug 
                    const nameMatched = outgoing.find((n) =>
                        n.type === "intervention" &&
                        (n.data as any).actions?.includes(name)
                    );
                    if (nameMatched) {
                        if (!(isRequired && requiredDoseOk)) {
                            const fallbackData: OutcomeNodeData = {
                                outcomeType: "deteriorated",
                                narrative: `"${name}" — wrong dose. The patient is not responding as expected.`,
                                newSymptoms: "",
                                vitalChanges: {},
                            };
                            setHealth((h) => Math.max(0, h - 30));
                            setOutcomeModal(fallbackData);
                            recordEvent({ kind: "outcome", timestamp: elapsed, outcomeType: "deteriorated" });
                        }
                    } else if (!isRequired) {
                        const fallbackData: OutcomeNodeData = {
                            outcomeType: "deteriorated",
                            narrative: `"${name}" is not an appropriate intervention for this case.`,
                            newSymptoms: "",
                            vitalChanges: {},
                        };
                        setHealth((h) => Math.max(0, h - 30));
                        setOutcomeModal(fallbackData);
                        recordEvent({ kind: "outcome", timestamp: elapsed, outcomeType: "deteriorated" });
                    }
                }
            }

        }
    }, [recordEvent, caseData, elapsed, requiredActions, requiredDoseMap, selectedInterventions]);

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

    const diagnosisSuggestions = useMemo(() => {
        if (!diagnosisInput.trim() || diagnosisResult) return [];
        const lower = diagnosisInput.toLowerCase();
        if (DISEASES_DB.some((d) => d.name.toLowerCase() === lower)) return [];
        return DISEASES_DB.filter((d) => d.name.toLowerCase().includes(lower));
    }, [diagnosisInput, diagnosisResult]);

    const handleDiagnosisSubmit = useCallback(() => {
        const correct = caseData?.diagnoses ?? [];
        if (correct.some((d) => d.toLowerCase() === diagnosisInput.trim().toLowerCase())) {
            setDiagnosisResult("correct");
        } else {
            setDiagnosisResult("wrong");
        }
    }, [diagnosisInput, caseData]);

    const handleDiagnosisKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (activeIdx >= 0 && activeIdx < diagnosisSuggestions.length) {
                setDiagnosisInput(diagnosisSuggestions[activeIdx].name);
                setActiveIdx(-1);
            } else {
                handleDiagnosisSubmit();
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx((prev) => Math.min(prev + 1, diagnosisSuggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((prev) => Math.max(prev - 1, -1));
        } else if (e.key === "Escape") {
            setActiveIdx(-1);
        }
    }, [diagnosisSuggestions, activeIdx, handleDiagnosisSubmit]);

    // Loading
    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 bg-canvas font-sans text-ink-500 text-sm" style={{ height: "calc(100vh - 48px)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-iris-600 animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
                Loading case…
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="flex items-center justify-center bg-canvas font-sans" style={{ height: "calc(100vh - 48px)" }}>
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
            <div className="bg-canvas font-sans flex items-center justify-center" style={{ height: "calc(100vh - 48px)" }}>
                <div className="max-w-md text-center">
                    <Heart size={48} className="text-iris-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-semibold text-ink-900 mb-1">{caseData.title || "Untitled case"}</h1>
                    <p className="text-sm text-ink-500 mb-1">
                        {caseData.age || "—"} y/o {caseData.sex} · {caseData.chiefComplaint || "No chief complaint"}
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
        <div className="fixed inset-x-0 top-12 bottom-0 bg-canvas font-sans">
            {/* Full-screen 3D scene */}
            <div className="absolute inset-0">
                <GameCanvas
                    vitals={resolvedVitals}
                    vitalsVisible={vitalsRequested}
                    elapsed={elapsed}
                    minutes={gameTimeUp ? 0 : minutes}
                    seconds={gameTimeUp ? 0 : seconds}
                    gameOver={gameTimeUp}
                />
            </div>

            {/* Elapsed timer + health bar — always visible */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                    <Clock size={14} />
                    {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                    <div className="w-20 h-2 rounded-full bg-white/20 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                                width: `${health}%`,
                                background: health > 50
                                    ? "#22c55e"
                                    : health > 25
                                        ? "#eab308"
                                        : "#ef4444",
                            }}
                        />
                    </div>
                    <span className="text-xs font-semibold text-white">{Math.round(health)}%</span>
                </div>
                {gameTimeUp && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 bg-rose-100/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                        Time is up!
                    </span>
                )}
            </div>
            {/* Event log */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 w-[320px] max-h-[40vh] overflow-y-auto bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-ink-900/8 p-3">
                <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wide mb-1">Event Log</p>
                {playerEvents.length === 0 && (
                    <p className="text-xs text-ink-300 italic">No events yet</p>
                )}
                <div className="flex flex-col gap-1.5">
                    {playerEvents.map((ev, i) => {
                        const time = `${String(Math.floor(ev.timestamp / 60)).padStart(2, "0")}:${String(ev.timestamp % 60).padStart(2, "0")}`;
                        const icon = ev.kind === "game_start" ? <Play size={12} /> :
                            ev.kind === "vitals_requested" ? <Activity size={12} /> :
                                ev.kind === "exam_performed" ? <Stethoscope size={12} /> :
                                    ev.kind === "test_ordered" ? <FlaskConical size={12} /> :
                                        ev.kind === "intervention_applied" ? <Syringe size={12} /> :
                                            ev.kind === "outcome" ? <AlertTriangle size={12} /> :
                                                ev.kind === "game_over" ? <Clock size={12} /> : null;
                        const label = ev.kind === "game_start" ? "Game started" :
                            ev.kind === "vitals_requested" ? "Vitals requested" :
                                ev.kind === "exam_performed" ? `Exam: ${ev.system}` :
                                    ev.kind === "test_ordered" ? `Test: ${ev.name}` :
                                        ev.kind === "intervention_applied" ? `Rx: ${ev.name}` :
                                            ev.kind === "outcome" ? `Outcome: ${ev.outcomeType}` :
                                                ev.kind === "game_over" ? "Time's up!" : ev.kind;
                        const outcomeBg: Record<string, string> = {
                            improved: "bg-emerald-100",
                            deteriorated: "bg-rose-100",
                            critical: "bg-red-100",
                            unchanged: "bg-ink-100",
                        };
                        const outcomeBgClass = ev.kind === "outcome" ? outcomeBg[ev.outcomeType] ?? "bg-ink-100" : "";
                        return (
                            <div key={i} className={`flex items-center gap-2 text-xs rounded px-1.5 py-1 ${outcomeBgClass}`}>
                                <span className="text-ink-300 font-mono w-10 shrink-0">{time}</span>
                                <span className="shrink-0">{icon}</span>
                                <span className="truncate">{label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Active panel content */}
            <div className="min-w-lg absolute bottom-6 left-6 z-10 flex flex-col gap-2 max-w-[420px] max-h-[55vh] overflow-y-auto bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-ink-900/8 p-4">
                {activeTab === "vitals" && (
                    <VitalsPanel
                        vitals={resolvedVitals}
                        requested={vitalsRequested}
                        onRequest={requestVitals}
                    />
                )}
                {activeTab === "history" && (
                    <HistoryPanel
                        historyGraph={caseData.historyGraph ?? { nodes: [], edges: [] }}
                        askedQuestions={askedQuestions}
                        onAskQuestion={(questionId) => {
                            setAskedQuestions((prev) => new Set([...Array.from(prev), questionId]));
                            const node = (caseData.historyGraph?.nodes ?? []).find((n) => n.id === questionId);
                            recordEvent({ kind: "history_question", timestamp: elapsed, questionId, questionText: node?.data.question ?? "" });
                        }}
                    />
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
                        onViewResult={setImagingResult}
                    />
                )}
                {activeTab === "management" && (
                    <ManagementPanel
                        caseData={caseData}
                        selectedInterventions={selectedInterventions}
                        unlockedDispositions={unlockedDispositions}
                        onSelectIntervention={applyIntervention}
                    />
                )}
            </div>
            {/* Game over modal */}
            {(() => {
                if (!gameOverReason) return null;
                const eventConfig = {
                    won: { icon: "🏆", title: "You Won!", color: "text-emerald-700" },
                    patientDied: { icon: "💀", title: "Patient Died", color: "text-red-700" },
                    timeOut: { icon: "⏰", title: "Time's Up", color: "text-amber-700" },
                };
                const cfg = eventConfig[gameOverReason.event];
                return (
                    <Modal open zIndex="z-[60]">
                        <div className="p-8 text-center">
                            <span className="text-4xl mb-3 block">{cfg.icon}</span>
                            <h2 className={`text-2xl font-bold ${cfg.color} mb-2`}>{cfg.title}</h2>
                            <p className="text-sm text-ink-600 mb-6">{gameOverReason.description}</p>
                            <p className="text-xs text-ink-400 mb-6">Elapsed time: {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</p>
                            <div className="border-t border-ink-900/8 pt-6">
                                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">What is your diagnosis?</label>
                                <div className="relative mb-3">
                                    <input
                                        type="text"
                                        value={diagnosisInput}
                                        onChange={(e) => { setDiagnosisInput(e.target.value); setActiveIdx(-1); setDiagnosisResult(null); }}
                                        onKeyDown={handleDiagnosisKeyDown}
                                        className="w-full rounded-lg border border-ink-900/16 px-3 py-2.5 text-sm text-ink-900 placeholder-ink-300 outline-none focus:border-iris-600 transition-colors"
                                        placeholder="Enter diagnosis..."
                                        disabled={!!diagnosisResult}
                                    />
                                    {diagnosisSuggestions.length > 0 && !diagnosisResult && (
                                        <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white rounded-lg border border-ink-900/8 shadow-lg max-h-48 overflow-y-auto">
                                            {diagnosisSuggestions.map((d, i) => (
                                                <button
                                                    key={d.id}
                                                    onMouseDown={() => { setDiagnosisInput(d.name); setActiveIdx(-1); }}
                                                    className={`w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors ${i === activeIdx ? "bg-iris-100 text-iris-700" : "text-ink-700 hover:bg-ink-50"}`}
                                                >
                                                    {d.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {diagnosisResult === "correct" && (
                                    <p className="text-sm font-semibold text-emerald-600 mb-3">✓ Correct diagnosis!</p>
                                )}
                                {diagnosisResult === "wrong" && (
                                    <p className="text-sm font-semibold text-rose-600 mb-3">✗ Incorrect. Correct diagnoses: {caseData.diagnoses.join(", ")}</p>
                                )}
                                {!diagnosisResult && (
                                    <button
                                        onClick={handleDiagnosisSubmit}
                                        className="w-full rounded-lg bg-iris-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-iris-700 transition-colors cursor-pointer"
                                    >
                                        Submit
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-1 rounded-lg border border-ink-900/8 px-4 py-2.5 text-sm font-semibold text-ink-500 hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => window.location.href = "/"}
                                    className="flex-1 rounded-lg bg-iris-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-iris-700 transition-colors cursor-pointer"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </Modal>
                );
            })()}

            {/* Imaging result modal */}
            {(() => {
                const img = imagingResult;
                if (!img || img.kind !== "imaging") return null;
                return (
                    <Modal open onClose={() => setImagingResult(null)} maxWidth="max-w-lg">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-ink-900 mb-4">{img.name}</h2>
                            <p className="text-sm text-ink-700 mb-3 leading-relaxed">{img.report || "No report entered."}</p>
                            {img.imageUrl && (
                                <img src={img.imageUrl} alt={img.name} className="max-w-full max-h-72 rounded border border-ink-900/8" />
                            )}
                            <button
                                onClick={() => setImagingResult(null)}
                                className="mt-4 w-full rounded-lg bg-iris-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-iris-700 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </Modal>
                );
            })()}

            {/* Outcome modal */}
            {(() => {
                if (!outcomeModal) return null;
                const colors: Record<string, { title: string; heading: string; bg: string; hover: string; label: string }> = {
                    improved: { title: "Condition Improved", heading: "text-emerald-700", bg: "bg-emerald-600", hover: "hover:bg-emerald-700", label: "text-emerald-600" },
                    deteriorated: { title: "Condition Deteriorated", heading: "text-rose-700", bg: "bg-rose-600", hover: "hover:bg-rose-700", label: "text-rose-600" },
                    critical: { title: "Critical Condition", heading: "text-red-700", bg: "bg-red-600", hover: "hover:bg-red-700", label: "text-red-600" },
                    unchanged: { title: "No Change", heading: "text-ink-600", bg: "bg-ink-500", hover: "hover:bg-ink-600", label: "text-ink-500" },
                };
                const c = colors[outcomeModal.outcomeType] ?? colors.deteriorated;
                return (
                    <Modal open onClose={() => setOutcomeModal(null)}>
                        <div className="p-6">
                            <h2 className={`text-lg font-semibold ${c.heading} mb-4`}>{c.title}</h2>
                            {outcomeModal.outcomeType !== "unlockEvent" && (
                                <>
                                    {outcomeModal.narrative && (
                                        <p className="text-sm text-ink-700 mb-3 leading-relaxed">{outcomeModal.narrative}</p>
                                    )}
                                    {outcomeModal.newSymptoms && (
                                        <div className="mb-3">
                                            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">New Symptoms</p>
                                            <p className="text-sm text-ink-700">{outcomeModal.newSymptoms}</p>
                                        </div>
                                    )}
                                    {Object.keys(outcomeModal.vitalChanges).some(k => outcomeModal.vitalChanges[k]) && (
                                        <div>
                                            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">Vital Changes</p>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {Object.entries(outcomeModal.vitalChanges).map(([key, val]) =>
                                                    val ? (
                                                        <div key={key} className="flex items-center gap-1.5">
                                                            <span className="font-mono text-xs text-ink-400 uppercase">{key}</span>
                                                            <span className={`font-semibold ${c.label}`}>{val}</span>
                                                        </div>
                                                    ) : null
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            <button
                                onClick={() => setOutcomeModal(null)}
                                className={`mt-4 w-full rounded-lg ${c.bg} px-4 py-2.5 text-sm font-semibold text-white ${c.hover} transition-colors cursor-pointer`}
                            >
                                Continue
                            </button>
                        </div>
                    </Modal>
                );
            })()}

            {/* Floating action panel — bottom-right */}
            <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 max-w-[420px]">
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
