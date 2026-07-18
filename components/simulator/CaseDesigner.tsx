"use client"

import React, { useState, useMemo, useEffect } from "react";
import { collection, addDoc, setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import type {
    CaseData, VitalSign, ExamFinding, Investigation, LabTest, LabInvestigation,
    ImagingInvestigation, StepProps, StepReviewProps,
} from "./types";
import {
    C, FONT_LINK, LAB_LIBRARY, IMAGING_LIBRARY, EXAM_SYSTEMS,
    MANAGEMENT_LIBRARY, OUTCOME_TYPES, VITAL_DEFS, DISEASES_DB,
} from "./database";
import {
    inputStyle, TextInput, TextArea, Field, PrimaryButton, GhostButton, Chip, Card, SectionHeading,
} from "./ui";
import StepManagement from "./GraphEditor";

const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------------------------------------------------------
   INITIAL STATE
--------------------------------------------------------------- */
const emptyCase: CaseData = {
    title: "",
    age: "",
    sex: "Female",
    chiefComplaint: "",
    diagnoses: [],
    background: "",
    vitals: VITAL_DEFS.reduce((acc, v) => {
        acc[v.key] = { value: "", abnormal: false };
        return acc;
    }, {} as Record<string, VitalSign>),
    exam: [],
    investigations: [],
    managementGraph: {
        nodes: [{ id: "start", type: "start", x: 40, y: 260, data: {} }],
        edges: [],
    },
};



/* ---------------------------------------------------------------
   STEP 0 — BACKGROUND
--------------------------------------------------------------- */
function StepBackground({ data, update }: StepProps) {
    const [diagInput, setDiagInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const addDiagnosis = (name?: string) => {
        const val = (name ?? diagInput).trim();
        if (!val) return;
        if ((data.diagnoses ?? []).includes(val)) return;
        update({ diagnoses: [...(data.diagnoses ?? []), val] });
        setDiagInput("");
        setShowSuggestions(false);
        setActiveIndex(-1);
    };
    const removeDiagnosis = (idx: number) => {
        update({ diagnoses: (data.diagnoses ?? []).filter((_, i) => i !== idx) });
    };

    const suggestions = useMemo(() => {
        if (!diagInput.trim()) return [];
        const lower = diagInput.toLowerCase();
        const existing = data.diagnoses ?? [];
        return DISEASES_DB.filter(
            (d) => d.name.toLowerCase().includes(lower) && !existing.includes(d.name)
        );
    }, [diagInput, data.diagnoses]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < suggestions.length) {
                addDiagnosis(suggestions[activeIndex].name);
            } else {
                addDiagnosis();
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, -1));
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
            setActiveIndex(-1);
        }
    };

    return (
        <div>
            <SectionHeading eyebrow="01 · Setup" title="Case background" desc="Set the scene: who the patient is and why they presented to the emergency department." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Case title">
                    <TextInput value={data.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. 58F with sudden chest pain" />
                </Field>
                <Field label="Chief complaint">
                    <TextInput value={data.chiefComplaint} onChange={(e) => update({ chiefComplaint: e.target.value })} placeholder="e.g. Crushing central chest pain, 45 minutes" />
                </Field>
                <Field label="Patient age">
                    <TextInput type="number" value={data.age} onChange={(e) => update({ age: e.target.value })} placeholder="e.g. 58" />
                </Field>
                <Field label="Patient sex">
                    <select value={data.sex} onChange={(e) => update({ sex: e.target.value })} style={inputStyle}>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Intersex / Unspecified</option>
                    </select>
                </Field>
            </div>
            <Field label="Diagnoses" hint="Definitive diagnosis/diagnoses for this case (hidden from students during play).">
                <div style={{ position: "relative", display: "flex", gap: 8, marginBottom: 8 }}>
                    <TextInput
                        value={diagInput}
                        onChange={(e) => { setDiagInput(e.target.value); setShowSuggestions(true); setActiveIndex(-1); }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. ST-elevation myocardial infarction (STEMI)"
                        style={{ flex: 1 }}
                    />
                    <PrimaryButton onClick={() => addDiagnosis()} style={{ height: 40, flexShrink: 0 }}>Add</PrimaryButton>
                    {showSuggestions && suggestions.length > 0 && (
                        <div style={{
                            position: "absolute", top: "100%", left: 0, right: 80, zIndex: 50,
                            background: C.surface, border: `1px solid ${C.line}`,
                            borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                            maxHeight: 220, overflowY: "auto", marginTop: 2,
                        }}>
                            {suggestions.map((s, i) => (
                                <div
                                    key={s.id}
                                    onMouseDown={() => addDiagnosis(s.name)}
                                    style={{
                                        padding: "8px 12px", cursor: "pointer",
                                        fontFamily: "'IBM Plex Sans'", fontSize: 13.5, color: C.ink,
                                        background: i === activeIndex ? C.accentSoft : "transparent",
                                    }}
                                >
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {(data.diagnoses?.length ?? 0) > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {data.diagnoses?.map((d, i) => (
                            <Chip key={i} color={C.accent} soft={C.accentSoft}>
                                {d}
                                <button onClick={() => removeDiagnosis(i)} style={{ border: "none", background: "none", color: C.inkFaint, cursor: "pointer", fontSize: 12, marginLeft: 6, padding: 0 }}>×</button>
                            </Chip>
                        ))}
                    </div>
                )}
            </Field>
            <Field label="Background & history" hint="Presenting story, past medical history, medications, allergies — whatever the student should see on arrival.">
                <TextArea value={data.background} onChange={(e) => update({ background: e.target.value })} placeholder="e.g. Known hypertension and type 2 diabetes. Sudden onset central chest pain radiating to the left arm while climbing stairs, associated with diaphoresis and nausea..." />
            </Field>
        </div>
    );
}

/* ---------------------------------------------------------------
   STEP 1 — VITALS
--------------------------------------------------------------- */
function StepVitals({ data, update }: StepProps) {
    const setVital = (key: string, patch: Partial<VitalSign>) => {
        update({ vitals: { ...data.vitals, [key]: { ...data.vitals[key], ...patch } } });
    };
    return (
        <div>
            <SectionHeading eyebrow="02 · Baseline" title="Vital signs" desc="Enter the values students see on the monitor at the start of the case. Flag any that are deliberately abnormal." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {VITAL_DEFS.map((v) => {
                    const cur = data.vitals[v.key];
                    return (
                        <Card key={v.key} style={{ borderColor: cur.abnormal ? C.abnormal : C.line }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 600, color: C.ink }}>{v.label}</span>
                                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.inkSoft, cursor: "pointer" }}>
                                    <input type="checkbox" checked={cur.abnormal} onChange={(e) => setVital(v.key, { abnormal: e.target.checked })} />
                                    abnormal
                                </label>
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                <input
                                    value={cur.value}
                                    onChange={(e) => setVital(v.key, { value: e.target.value })}
                                    placeholder="—"
                                    style={{
                                        width: 80,
                                        border: "none",
                                        borderBottom: `2px solid ${cur.abnormal ? C.abnormal : C.line}`,
                                        fontFamily: "'IBM Plex Mono'",
                                        fontSize: 22,
                                        fontWeight: 600,
                                        color: cur.abnormal ? C.abnormal : C.ink,
                                        background: "transparent",
                                        outline: "none",
                                        padding: "2px 0",
                                    }}
                                />
                                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, color: C.inkFaint }}>{v.unit}</span>
                            </div>
                            <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: C.inkFaint, marginTop: 6 }}>
                                normal {v.normal[0]}–{v.normal[1]}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------
   STEP 2 — PHYSICAL EXAM
--------------------------------------------------------------- */
function StepExam({ data, update }: StepProps) {
    const [system, setSystem] = useState(EXAM_SYSTEMS[0]);
    const [finding, setFinding] = useState("");
    const [abnormal, setAbnormal] = useState(true);

    const add = () => {
        if (!finding.trim()) return;
        update({ exam: [...data.exam, { id: uid(), system, finding, abnormal }] });
        setFinding("");
    };
    const remove = (id: string) => update({ exam: data.exam.filter((e) => e.id !== id) });

    return (
        <div>
            <SectionHeading eyebrow="03 · Baseline" title="Physical examination" desc="Add findings by system. Mark each as abnormal or a normal/reassuring finding." />
            <Card style={{ marginBottom: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr auto auto", gap: 10, alignItems: "end" }}>
                    <Field label="System">
                        <select value={system} onChange={(e) => setSystem(e.target.value)} style={inputStyle}>
                            {EXAM_SYSTEMS.map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Finding">
                        <TextInput value={finding} onChange={(e) => setFinding(e.target.value)} placeholder="e.g. Diaphoretic, S4 gallop present" onKeyDown={(e) => e.key === "Enter" && add()} />
                    </Field>
                    <Field label="Status">
                        <select value={abnormal ? "1" : "0"} onChange={(e) => setAbnormal(e.target.value === "1")} style={inputStyle}>
                            <option value="1">Abnormal</option>
                            <option value="0">Normal</option>
                        </select>
                    </Field>
                    <PrimaryButton onClick={add} style={{ height: 40 }}>Add finding</PrimaryButton>
                </div>
            </Card>

            {EXAM_SYSTEMS.map((s) => {
                const items = data.exam.filter((e) => e.system === s);
                if (!items.length) return null;
                return (
                    <div key={s} style={{ marginBottom: 16 }}>
                        <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12.5, fontWeight: 600, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>{s}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {items.map((it) => (
                                <div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 6, padding: "8px 12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <Chip color={it.abnormal ? C.abnormal : C.normal} soft={it.abnormal ? C.abnormalSoft : C.normalSoft}>
                                            {it.abnormal ? "ABN" : "NL"}
                                        </Chip>
                                        <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, color: C.ink }}>{it.finding}</span>
                                    </div>
                                    <button onClick={() => remove(it.id)} style={{ border: "none", background: "none", color: C.inkFaint, cursor: "pointer", fontSize: 12 }}>remove</button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            {data.exam.length === 0 && <div style={{ color: C.inkFaint, fontFamily: "'IBM Plex Sans'", fontSize: 14 }}>No findings added yet.</div>}
        </div>
    );
}

/* ---------------------------------------------------------------
   STEP 3 — INVESTIGATIONS
--------------------------------------------------------------- */
function StepInvestigations({ data, update, caseId }: StepProps & { caseId: string | null }) {
    const [tab, setTab] = useState("labs");
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const addLab = (category: string, test: LabTest) => {
        const lab: LabInvestigation = { id: uid(), kind: "lab", category, name: test.name, unit: test.unit, normalRange: test.normal, value: "", abnormal: false };
        update({
            investigations: [
                ...data.investigations,
                lab,
            ],
        });
    };
    const addImaging = (name: string) => {
        const img: ImagingInvestigation = { id: uid(), kind: "imaging", category: "Imaging", name, unit: "", normalRange: "unremarkable", value: "", abnormal: false, report: "", imageUrl: "" };
        update({
            investigations: [
                ...data.investigations,
                img,
            ],
        });
    };

    const handleImageUpload = async (id: string, file: File) => {
        setUploadingId(id);
        const token = await auth.currentUser?.getIdToken();
        if (!token || !caseId) { setUploadingId(null); return; }
        const reader = new FileReader();
        reader.onload = async () => {
            const imageData = reader.result as string;
            try {
                const res = await fetch("https://us-central1-rama-toxico-edu.cloudfunctions.net/imageUpload", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ imageData, caseId, investigationId: id }),
                });
                const data = await res.json();
                console.log(data)
                if (data.imageUrl) {
                    patch(id, { imageUrl: data.imageUrl });
                }

            } catch (err) {
                console.error("Image upload failed:", err);
            } finally {
                setUploadingId(null);
            }
        };
        reader.readAsDataURL(file);
    };
    const patch = (id: string, p: Partial<Investigation>) => update({ investigations: data.investigations.map((i) => (i.id === id ? { ...i, ...p } : i)) as Investigation[] });
    const remove = (id: string) => update({ investigations: data.investigations.filter((i) => i.id !== id) });

    const added = data.investigations;

    return (
        <div>
            <SectionHeading eyebrow="04 · Baseline" title="Investigations" desc="Pick from common ER labs and imaging, then set the value the student will see." />

            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {["labs", "imaging"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            border: "none",
                            background: tab === t ? C.accent : C.paperDeep,
                            color: tab === t ? "#fff" : C.inkSoft,
                            fontFamily: "'IBM Plex Sans'",
                            fontWeight: 600,
                            fontSize: 13,
                            borderRadius: 6,
                            padding: "8px 16px",
                            cursor: "pointer",
                            textTransform: "capitalize",
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === "labs" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 26 }}>
                    {Object.entries(LAB_LIBRARY).map(([cat, tests]) => (
                        <Card key={cat}>
                            <div style={{ fontFamily: "'IBM Plex Sans'", fontWeight: 600, fontSize: 13.5, color: C.ink, marginBottom: 10 }}>{cat}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {tests.map((t) => (
                                    <button
                                        key={t.name}
                                        onClick={() => addLab(cat, t)}
                                        style={{
                                            textAlign: "left",
                                            border: `1px solid ${C.line}`,
                                            background: C.paper,
                                            borderRadius: 5,
                                            padding: "6px 9px",
                                            fontFamily: "'IBM Plex Sans'",
                                            fontSize: 12.5,
                                            color: C.inkSoft,
                                            cursor: "pointer",
                                        }}
                                    >
                                        + {t.name}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {tab === "imaging" && (
                <Card style={{ marginBottom: 26 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {IMAGING_LIBRARY.map((name) => (
                            <button
                                key={name}
                                onClick={() => addImaging(name)}
                                style={{
                                    border: `1px solid ${C.accent}`,
                                    background: C.accentSoft,
                                    color: C.accent,
                                    borderRadius: 6,
                                    padding: "7px 13px",
                                    fontFamily: "'IBM Plex Sans'",
                                    fontWeight: 600,
                                    fontSize: 12.5,
                                    cursor: "pointer",
                                }}
                            >
                                + {name}
                            </button>
                        ))}
                    </div>
                </Card>
            )}

            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12.5, fontWeight: 600, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 10 }}>
                Selected for this case ({added.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {added.map((inv) => (
                    <div key={inv.id} style={{ background: C.surface, border: `1px solid ${inv.abnormal ? C.abnormal : C.line}`, borderRadius: 7, padding: "10px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: inv.kind === "lab" ? 8 : 6 }}>
                            <div>
                                <span style={{ fontFamily: "'IBM Plex Sans'", fontWeight: 600, fontSize: 14, color: C.ink }}>{inv.name}</span>
                                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: C.inkFaint, marginLeft: 8 }}>{inv.category}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.inkSoft, cursor: "pointer" }}>
                                    <input type="checkbox" checked={inv.abnormal} onChange={(e) => patch(inv.id, { abnormal: e.target.checked })} />
                                    abnormal
                                </label>
                                <button onClick={() => remove(inv.id)} style={{ border: "none", background: "none", color: C.inkFaint, cursor: "pointer", fontSize: 12 }}>remove</button>
                            </div>
                        </div>
                        {inv.kind === "lab" ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                    value={inv.value}
                                    onChange={(e) => patch(inv.id, { value: e.target.value })}
                                    placeholder="value"
                                    style={{ width: 110, border: `1px solid ${C.line}`, borderRadius: 5, padding: "5px 8px", fontFamily: "'IBM Plex Mono'", fontSize: 13.5, color: inv.abnormal ? C.abnormal : C.ink }}
                                />
                                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11.5, color: C.inkFaint }}>{inv.unit}</span>
                                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: C.inkFaint }}>· normal {inv.normalRange}</span>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                    <TextArea
                                        value={inv.report}
                                        onChange={(e) => patch(inv.id, { report: e.target.value })}
                                        placeholder="Describe the reported finding, e.g. 'ST elevation in leads II, III, aVF' or 'Widened mediastinum'"
                                        style={{ minHeight: 56, fontSize: 13.5, flex: 1 }}
                                    />
                                    <label
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 4,
                                            width: 80,
                                            minHeight: 56,
                                            border: `1px dashed ${uploadingId === inv.id ? C.accent : C.line}`,
                                            borderRadius: 6,
                                            cursor: uploadingId === inv.id ? "default" : "pointer",
                                            color: uploadingId === inv.id ? C.accent : C.inkFaint,
                                            fontSize: 11,
                                            fontFamily: "'IBM Plex Sans'",
                                            flexShrink: 0,
                                            opacity: uploadingId === inv.id ? 0.6 : 1,
                                        }}
                                    >
                                        {uploadingId === inv.id ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                        )}
                                        {uploadingId === inv.id ? "Uploading…" : "Upload"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            disabled={uploadingId === inv.id}
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) handleImageUpload(inv.id, f);
                                            }}
                                        />
                                    </label>
                                </div>
                                {inv.imageUrl && (
                                    <div style={{ position: "relative", display: "inline-block" }}>
                                        <img
                                            src={inv.imageUrl}
                                            alt={inv.name}
                                            style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 6, border: `1px solid ${C.line}`, display: "block" }}
                                        />
                                        <button
                                            onClick={() => patch(inv.id, { imageUrl: "" })}
                                            style={{
                                                position: "absolute",
                                                top: 4,
                                                right: 4,
                                                border: "none",
                                                background: "rgba(0,0,0,0.5)",
                                                color: "#fff",
                                                borderRadius: 4,
                                                width: 22,
                                                height: 22,
                                                cursor: "pointer",
                                                fontSize: 13,
                                                lineHeight: "22px",
                                                textAlign: "center",
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {added.length === 0 && <div style={{ color: C.inkFaint, fontFamily: "'IBM Plex Sans'", fontSize: 14 }}>Nothing selected yet — click an item above to add it.</div>}
            </div>
        </div>
    );
}



/* ---------------------------------------------------------------
   STEP 5 — REVIEW
--------------------------------------------------------------- */
function StepReview({ data }: StepReviewProps) {
    const abnormalVitals = VITAL_DEFS.filter((v) => data.vitals[v.key].abnormal);
    return (
        <div>
            <SectionHeading eyebrow="06 · Review" title="Case sheet" desc="This is how the case will read once published. Scroll back through the steps to make changes." />
            <Card style={{ padding: 24 }}>
                <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11.5, color: C.accent, fontWeight: 600, letterSpacing: 1 }}>
                    {data.age || "—"} y/o {data.sex} · {data.chiefComplaint || "no chief complaint set"}
                </div>
                <h3 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 26, color: C.ink, margin: "6px 0 14px" }}>{data.title || "Untitled case"}</h3>
                {data.diagnoses?.length > 0 && (
                    <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10 }}>
                        Diagnoses: {data.diagnoses.join(", ")}
                    </div>
                )}
                <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14.5, color: C.inkSoft, lineHeight: 1.6, marginBottom: 22 }}>{data.background || "No background written yet."}</p>

                <div style={{ marginBottom: 22 }}>
                    <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12.5, fontWeight: 600, color: C.inkSoft, textTransform: "uppercase", marginBottom: 10 }}>Vital signs on arrival</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {VITAL_DEFS.map((v) => {
                            const cur = data.vitals[v.key];
                            return (
                                <div key={v.key} style={{ background: cur.abnormal ? C.abnormalSoft : C.paperDeep, borderRadius: 6, padding: "8px 12px", minWidth: 84 }}>
                                    <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, color: C.inkFaint }}>{v.label}</div>
                                    <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 17, fontWeight: 600, color: cur.abnormal ? C.abnormal : C.ink }}>{cur.value || "—"}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                    <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12.5, fontWeight: 600, color: C.inkSoft, textTransform: "uppercase", marginBottom: 10 }}>
                        Physical exam ({data.exam.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {data.exam.map((e) => (
                            <div key={e.id} style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13.5, color: C.ink }}>
                                <Chip color={e.abnormal ? C.abnormal : C.normal} soft={e.abnormal ? C.abnormalSoft : C.normalSoft}>{e.abnormal ? "ABN" : "NL"}</Chip>{" "}
                                <span style={{ color: C.inkSoft }}>{e.system}:</span> {e.finding}
                            </div>
                        ))}
                        {data.exam.length === 0 && <span style={{ color: C.inkFaint, fontSize: 13.5 }}>None recorded.</span>}
                    </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                    <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12.5, fontWeight: 600, color: C.inkSoft, textTransform: "uppercase", marginBottom: 10 }}>
                        Investigations ({data.investigations.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {data.investigations.map((i) => (
                            <div key={i.id} style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13.5, color: C.ink }}>
                                <Chip color={i.abnormal ? C.abnormal : C.normal} soft={i.abnormal ? C.abnormalSoft : C.normalSoft}>{i.abnormal ? "ABN" : "NL"}</Chip>{" "}
                                {i.name}: <span style={{ fontFamily: "'IBM Plex Mono'" }}>{i.kind === "lab" ? `${i.value || "—"} ${i.unit}` : i.report || "—"}</span>
                            </div>
                        ))}
                        {data.investigations.length === 0 && <span style={{ color: C.inkFaint, fontSize: 13.5 }}>None recorded.</span>}
                    </div>
                </div>

                <div>
                    {(() => {
                        const nodes = data.managementGraph.nodes;
                        const edges = data.managementGraph.edges;
                        const interventions = nodes.filter((n) => n.type === "intervention");
                        const timers = nodes.filter((n) => n.type === "timer");
                        const outcomes = nodes.filter((n) => n.type === "outcome");
                        return (
                            <>
                                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12.5, fontWeight: 600, color: C.inkSoft, textTransform: "uppercase", marginBottom: 10 }}>
                                    Decision graph — {interventions.length} intervention{interventions.length !== 1 ? "s" : ""}, {timers.length} timer{timers.length !== 1 ? "s" : ""}, {outcomes.length} outcome{outcomes.length !== 1 ? "s" : ""}, {edges.length} connection{edges.length !== 1 ? "s" : ""}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {outcomes.map((n) => {
                                        const o = OUTCOME_TYPES.find((x) => x.key === n.data.outcomeType);
                                        if (!o) return null;
                                        const incoming = edges.filter((e) => e.target === n.id).map((e) => {
                                            const src = nodes.find((s) => s.id === e.source);
                                            if (!src) return null;
                                            const label = src.type === "intervention" ? (src.data.actions?.length > 1 ? `${src.data.actions[0]} +${src.data.actions.length - 1}` : src.data.actions?.[0] || "?") : src.type === "timer" ? `${src.data.minutes}min: ${src.data.note}` : "Case start";
                                            return e.label ? `${label} (${e.label})` : label;
                                        }).filter(Boolean);
                                        return (
                                            <div key={n.id} style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13.5 }}>
                                                <Chip color={o.color} soft={o.soft}>{o.label}</Chip>{" "}
                                                <span style={{ color: C.inkSoft }}>{incoming.length ? `from: ${incoming.join(", ")}` : "not yet connected"}</span>
                                                {n.data.outcomeType !== "unlockEvent" && n.data.narrative && <div style={{ color: C.ink, marginTop: 2, marginLeft: 2 }}>{n.data.narrative}</div>}
                                            </div>
                                        );
                                    })}
                                    {outcomes.length === 0 && <span style={{ color: C.inkFaint, fontSize: 13.5 }}>No outcome nodes yet — build the graph in the Management step.</span>}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </Card>
        </div>
    );
}

/* ---------------------------------------------------------------
   APP SHELL
--------------------------------------------------------------- */
const STEPS = [
    { key: "background", label: "Background", num: "01" },
    { key: "vitals", label: "Vital signs", num: "02" },
    { key: "exam", label: "Physical exam", num: "03" },
    { key: "investigations", label: "Investigations", num: "04" },
    { key: "management", label: "Management & outcomes", num: "05" },
    { key: "review", label: "Case sheet", num: "06" },
];

export default function CaseDesigner({ caseId: initialCaseId, sidebarOpen, setSidebarOpen }: { caseId?: string; sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void }) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [caseData, setCaseData] = useState(emptyCase);
    const [saving, setSaving] = useState(false);
    const [caseId, setCaseId] = useState<string | null>(initialCaseId && initialCaseId !== "new" ? initialCaseId : null);
    const [loading, setLoading] = useState(!!initialCaseId && initialCaseId !== "new");
    const update = (patch: Partial<CaseData>) => {

        setCaseData((d) => ({ ...d, ...patch }))
        console.log(caseData)
    };

    useEffect(() => {
        if (!initialCaseId || initialCaseId === "new") return;
        (async () => {
            try {
                const snap = await getDoc(doc(db, "simulations", initialCaseId));
                if (snap.exists()) {
                    const raw = snap.data() as CaseData & { diagnosis?: string };
                    if (!Array.isArray(raw.diagnoses) && raw.diagnosis) {
                        raw.diagnoses = [raw.diagnosis];
                    }
                    raw.diagnoses ??= [];
                    // migrate old node data formats
                    if (raw.managementGraph?.nodes) {
                        raw.managementGraph.nodes = raw.managementGraph.nodes.map((n) => {
                            if (n.type === "intervention" && !Array.isArray((n.data as any).actions)) {
                                const old = n.data as any;
                                const actions: string[] = [];
                                if (old.custom) actions.push(old.custom);
                                if (old.name && !actions.includes(old.name)) actions.push(old.name);
                                if (Array.isArray(old.options)) old.options.forEach((o: string) => { if (!actions.includes(o)) actions.push(o); });
                                return { ...n, data: { actions: actions.length > 0 ? actions : [old.name || "?"] } };
                            }
                            if (n.type === "required" && !Array.isArray((n.data as any).actions)) {
                                const old = n.data as any;
                                if (Array.isArray(old.required)) {
                                    if (old.required[0]?.items) {
                                        return { ...n, data: { actions: old.required.map((g: any) => ({ or: g.items.map((r: any) => r.name) })) } };
                                    }
                                    if (old.required[0]?.category) {
                                        return { ...n, data: { actions: old.required.map((r: any) => ({ or: [r.name] })) } };
                                    }
                                }
                                return { ...n, data: { actions: [{ or: ["?"] }] } };
                            }
                            if (n.type === "required" && Array.isArray((n.data as any).actions) && Array.isArray((n.data as any).actions[0])) {
                                const old = n.data as any;
                                return { ...n, data: { actions: old.actions.map((g: string[]) => ({ or: g })) } };
                            }
                            return n;
                        });
                    }
                    setCaseData(raw as CaseData);
                }
            } catch (err) {
                console.error("Failed to load case:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [initialCaseId]);

    function stripUndefined(obj: unknown): unknown {
        if (Array.isArray(obj)) return obj.map(stripUndefined);
        if (obj && typeof obj === "object" && !(obj as any).toDate && !(obj as any).isEqual) {
            const clean: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(obj)) {
                if (v !== undefined) clean[k] = stripUndefined(v);
            }
            return clean;
        }
        return obj;
    }

    const updateCase = async () => {
        setSaving(true);
        try {
            const payload = {
                ...caseData,
                createdBy: auth.currentUser?.uid || null,
                createdAt: serverTimestamp(),
            };
            if (caseId) {
                await setDoc(doc(db, "simulations", caseId), stripUndefined(payload) as Record<string, unknown>);
            } else {
                const ref = await addDoc(collection(db, "simulations"), stripUndefined(payload) as Record<string, unknown>);
                setCaseId(ref.id);
                router.push(`/simulator/${ref.id}`);
            }
        } catch (err) {
            console.error("Failed to save case:", err);
        } finally {
            setSaving(false);
        }
    };

    const progress = useMemo(() => {
        let filled = 0;
        if (caseData.title && caseData.background) filled++;
        if (Object.values(caseData.vitals).some((v) => v.value)) filled++;
        if (caseData.exam.length) filled++;
        if (caseData.investigations.length) filled++;
        if (caseData.managementGraph.nodes.length > 1) filled++;
        return filled;
    }, [caseData]);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: "100vh", background: C.paper, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", color: C.inkSoft, fontSize: 14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Loading case…
            </div>
        );
    }

    return (
        <div style={{ background: C.paper, minHeight: "100vh", fontFamily: "'IBM Plex Sans'" }}>
            {/* font + global reset */}
            <style dangerouslySetInnerHTML={{
                __html: `@import url('${FONT_LINK}'); * { box-sizing: border-box; } input:focus, textarea:focus, select:focus { border-color: ${C.accent} !important; }
                .sidebar-overlay { display: none; }
                @media (max-width: 768px) {
                    .sidebar-desktop { display: none !important; }
                    .sidebar-overlay { display: block; }
                }
                @media (min-width: 769px) {
                    .sidebar-mobile { display: none !important; }
                }
            ` }} />

            <div style={{ display: "flex", maxWidth: 1180, margin: "0 auto" }}>
                {/* sidebar overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="sidebar-overlay"
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.35)",
                            zIndex: 99,
                        }}
                    />
                )}

                {/* stepper — desktop */}
                <div className="sidebar-desktop" style={{ width: 240, flexShrink: 0, padding: "28px 16px", borderRight: `1px solid ${C.line}` }}>
                    {STEPS.map((s, i) => {
                        const disabled = !caseId && i > 0;
                        return (
                            <button
                                key={s.key}
                                onClick={() => !disabled && setStep(i)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    width: "100%",
                                    textAlign: "left",
                                    border: "none",
                                    background: i === step ? C.accentSoft : "transparent",
                                    borderRadius: 7,
                                    padding: "10px 12px",
                                    marginBottom: 4,
                                    cursor: disabled ? "default" : "pointer",
                                    opacity: disabled ? 0.4 : 1,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "'IBM Plex Mono'",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: i === step ? C.accent : C.inkFaint,
                                    }}
                                >
                                    {s.num}
                                </span>
                                <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13.5, fontWeight: i === step ? 600 : 500, color: i === step ? C.accent : (disabled ? C.inkFaint : C.inkSoft) }}>{s.label}</span>
                            </button>
                        );
                    })}

                    <div style={{ marginTop: 24, padding: "0 12px" }}>
                        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, color: C.inkFaint, marginBottom: 6 }}>
                            {progress}/5 SECTIONS STARTED
                        </div>
                        <div style={{ height: 4, background: C.line, borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(progress / 5) * 100}%`, background: C.normal }} />
                        </div>
                    </div>
                </div>

                {/* stepper — mobile drawer */}
                <div
                    className="sidebar-mobile"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: 260,
                        background: C.surface,
                        borderRight: `1px solid ${C.line}`,
                        zIndex: 100,
                        padding: "28px 16px",
                        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                        transition: "transform 0.2s ease",
                        overflowY: "auto",
                    }}
                >
                    {STEPS.map((s, i) => {
                        const disabled = !caseId && i > 0;
                        return (
                            <button
                                key={s.key}
                                onClick={() => { if (!disabled) { setStep(i); setSidebarOpen(false); } }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    width: "100%",
                                    textAlign: "left",
                                    border: "none",
                                    background: i === step ? C.accentSoft : "transparent",
                                    borderRadius: 7,
                                    padding: "10px 12px",
                                    marginBottom: 4,
                                    cursor: disabled ? "default" : "pointer",
                                    opacity: disabled ? 0.4 : 1,
                                }}
                            >
                                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, fontWeight: 700, color: i === step ? C.accent : C.inkFaint }}>
                                    {s.num}
                                </span>
                                <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13.5, fontWeight: i === step ? 600 : 500, color: i === step ? C.accent : (disabled ? C.inkFaint : C.inkSoft) }}>{s.label}</span>
                            </button>
                        );
                    })}
                    <div style={{ marginTop: 24, padding: "0 12px" }}>
                        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10.5, color: C.inkFaint, marginBottom: 6 }}>
                            {progress}/5 SECTIONS STARTED
                        </div>
                        <div style={{ height: 4, background: C.line, borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(progress / 5) * 100}%`, background: C.normal }} />
                        </div>
                    </div>
                </div>

                {/* main content */}
                <div style={{ flex: 1, padding: "32px 40px 80px", overflowX: "auto", minWidth: 0 }}>
                    {step === 0 && <StepBackground data={caseData} update={update} />}
                    {step === 1 && <StepVitals data={caseData} update={update} />}
                    {step === 2 && <StepExam data={caseData} update={update} />}
                    {step === 3 && <StepInvestigations data={caseData} update={update} caseId={caseId} />}
                    {step === 4 && <StepManagement data={caseData} update={update} />}
                    {step === 5 && <StepReview data={caseData} />}

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 20, borderTop: `1px solid ${C.line}` }}>
                        <GhostButton onClick={() => setStep((s) => Math.max(0, s - 1))} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
                            ← Back
                        </GhostButton>
                        {step < STEPS.length - 1 ? (
                            <PrimaryButton
                                onClick={async () => { await updateCase(); setStep((s) => Math.min(STEPS.length - 1, s + 1)) }}
                                disabled={saving || (step === 0 && !caseId && (!caseData.title || !caseData.chiefComplaint || !caseData.age || !caseData.background))}
                            >{saving ? "Saving…" : step === 0 && !caseId ? "Create new case →" : "Continue →"}</PrimaryButton>
                        ) : (
                            <PrimaryButton onClick={updateCase} disabled={saving}>{saving ? "Saving…" : "Publish case"}</PrimaryButton>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}