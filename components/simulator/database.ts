import type { VitalDef, OutcomeType, LabTest, NodeSize, NodeMeta } from "./types";

export const C = {
    paper: "#fafaf9",
    paperDeep: "#f5f3ff",
    surface: "#FFFFFF",
    ink: "#1a1523",
    inkSoft: "#3f3856",
    inkFaint: "#6b6480",
    line: "rgba(26,21,35,0.08)",
    lineStrong: "rgba(26,21,35,0.14)",
    accent: "#7c5cfc",
    accentSoft: "#ede9fe",
    normal: "#0a8f7a",
    normalSoft: "#ccefe8",
    abnormal: "#ff6fa5",
    abnormalSoft: "#ffe3ed",
    critical: "#e6355a",
    criticalSoft: "#fde1e8",
    orange: "#d98c2e",
    orangeSoft: "#f5e2c4",
    blue: "#4f7cff",
    blueSoft: "#dbe5ff",
};

export const FONT_LINK = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

export const LAB_COSTS: Record<string, number> = {
    CBC: 120,
    Elytes: 120,
    "BUN/Cr": 60,
    Glucose: 30,
    "Additional Elytes": 120,
    "Cardiac Enzymes": 180,
    Coagulation: 120,
    "Liver Panel": 120
};

export const OTHER_LAB_COSTS: Record<string, number> = {
    Lipase: 60,
    Lactate: 60,
    "ABG pH": 60,
    "ABG pCO2": 60,
    "ABG HCO3": 60,
    Urinalysis: 90,
    "Blood Cultures": 120,
    "Type & Screen": 120,
};

export const LAB_LIBRARY: Record<string, LabTest[]> = {
    CBC: [
        { name: "Hemoglobin", unit: "g/dL", normal: "12.0–15.5" },
        { name: "WBC", unit: "x10\u00b3/\u00b5L", normal: "4.5–11.0" },
        { name: "Platelets", unit: "x10\u00b3/\u00b5L", normal: "150–400" },
        { name: "Hematocrit", unit: "%", normal: "36–46" },
    ],
    Elytes: [
        { name: "Sodium", unit: "mmol/L", normal: "135–145" },
        { name: "Potassium", unit: "mmol/L", normal: "3.5–5.0" },
        { name: "Chloride", unit: "mmol/L", normal: "98–107" },
        { name: "CO2", unit: "mmol/L", normal: "23–29" },
    ],
    "BUN/Cr": [
        { name: "BUN", unit: "mg/dL", normal: "7–20" },
        { name: "Creatinine", unit: "mg/dL", normal: "0.6–1.3" },
    ],
    Glucose: [
        { name: "Glucose", unit: "mg/dL", normal: "70–100" },
    ],
    "Additional Elytes": [
        { name: "Calcium", unit: "mg/dL", normal: "8.5–10.5" },
        { name: "Magnesium", unit: "mg/dL", normal: "1.7–2.2" },
        { name: "Phosphorus", unit: "mg/dL", normal: "2.5–4.5" },
    ],
    "Cardiac Enzymes": [
        { name: "Troponin I", unit: "ng/mL", normal: "<0.04" },
        { name: "CK-MB", unit: "ng/mL", normal: "0–5" },
        { name: "BNP", unit: "pg/mL", normal: "<100" },
    ],
    Coagulation: [
        { name: "PT/INR", unit: "", normal: "0.9–1.1" },
        { name: "PTT", unit: "sec", normal: "25–35" },
        { name: "Fibrinogen", unit: "mg/dL", normal: "200–400" },
        { name: "D-dimer", unit: "ng/mL", normal: "<500" },
    ],
    "Liver Panel": [
        { name: "AST", unit: "U/L", normal: "10–40" },
        { name: "ALT", unit: "U/L", normal: "7–56" },
        { name: "ALP", unit: "U/L", normal: "44–147" },
        { name: "Total Bilirubin", unit: "mg/dL", normal: "0.1–1.2" },
        { name: "Albumin", unit: "g/dL", normal: "3.5–5.0" },
    ],
    "Other Labs": [
        { name: "Lipase", unit: "U/L", normal: "10–140" },
        { name: "Lactate", unit: "mmol/L", normal: "0.5–2.2" },
        { name: "ABG pH", unit: "", normal: "7.35–7.45" },
        { name: "ABG pCO2", unit: "mmHg", normal: "35–45" },
        { name: "ABG HCO3", unit: "mmol/L", normal: "22–26" },
        { name: "Urinalysis", unit: "", normal: "unremarkable" },
        { name: "Blood Cultures", unit: "", normal: "no growth" },
        { name: "Type & Screen", unit: "", normal: "compatible" },
    ],
};

export const IMAGING_LIBRARY: string[] = [
    "Chest X-ray",
    "Abdominal X-ray",
    "CT Brain (non-contrast)",
    "CT Chest",
    "CT Abdomen/Pelvis",
    "12-Lead ECG",
    "POCUS / FAST",
];

export const EXAM_SYSTEMS: string[] = [
    "General appearance",
    "HEENT",
    "Cardiovascular",
    "Respiratory",
    "Abdominal",
    "Neurological",
    "Extremities / Skin",
];

export const MANAGEMENT_LIBRARY: Record<string, string[]> = {
    "IV Access & Fluids": ["Normal Saline bolus", "Lactated Ringer's bolus", "Maintenance IV fluids"],
    "Oxygen & Airway": ["Supplemental O2 (nasal cannula)", "Non-rebreather mask", "Endotracheal intubation", "BiPAP / CPAP"],
    "Analgesia & Sedation": ["Morphine IV", "Fentanyl IV", "Acetaminophen PO/IV", "Ketorolac IV"],
    Antiemetics: ["Ondansetron IV"],
    Antibiotics: ["Ceftriaxone IV", "Vancomycin IV", "Piperacillin-Tazobactam IV", "Azithromycin PO", "Metronidazole IV"],
    Cardiac: ["Amiodarone IV", "Adenosine IV", "Aspirin PO", "Nitroglycerin SL", "Synchronized cardioversion", "Defibrillation"],
    Antihypertensives: ["Labetalol IV", "Nicardipine IV", "Nitroglycerin IV"],
    Vasopressors: ["Norepinephrine infusion", "Epinephrine IV push", "Dopamine infusion"],
    Respiratory: ["Albuterol nebulizer", "Ipratropium nebulizer", "Methylprednisolone IV"],
    "Anticoagulation / Reversal": ["Heparin infusion", "Vitamin K IV", "FFP transfusion", "PRBC transfusion"],
    Procedures: ["Chest tube insertion", "Central line placement", "Lumbar puncture", "Foley catheter"],
    Disposition: ["Admit to floor", "Admit to ICU", "Transfer to OR", "Discharge home", "Transfer to another facility"],
};

export const OUTCOME_TYPES: OutcomeType[] = [
    { key: "improved", label: "Improved", color: C.normal, soft: C.normalSoft },
    { key: "stable", label: "No change", color: C.inkSoft, soft: C.paperDeep },
    { key: "deteriorated", label: "Deteriorated", color: C.orange, soft: C.orangeSoft },
    { key: "critical", label: "Critical / Death", color: C.critical, soft: C.criticalSoft },
    { key: "unlock-event", label: "Unlock event", color: C.accent, soft: C.accentSoft },
];

export const VITAL_DEFS: VitalDef[] = [
    { key: "hr", label: "Heart Rate", unit: "bpm", normal: [60, 100] },
    { key: "sbp", label: "Systolic BP", unit: "mmHg", normal: [90, 120] },
    { key: "dbp", label: "Diastolic BP", unit: "mmHg", normal: [60, 80] },
    { key: "rr", label: "Resp. Rate", unit: "/min", normal: [12, 20] },
    { key: "temp", label: "Temperature", unit: "\u00b0C", normal: [36.5, 37.5] },
    { key: "spo2", label: "SpO\u2082", unit: "%", normal: [95, 100] },
    { key: "gcs", label: "GCS", unit: "/15", normal: [15, 15] },
];

export const NODE_SIZE: Record<string, NodeSize> = {
    start: { w: 150, h: 54 },
    timer: { w: 210, h: 76 },
    intervention: { w: 220, h: 82 },
    "required-intervention": { w: 240, h: 100 },
    outcome: { w: 230, h: 100 },
    end: { w: 180, h: 64 },
};

export const NODE_META: Record<string, NodeMeta> = {
    start: { label: "Case Start", color: "#787878", soft: "#f0f0f0" },
    timer: { label: "Timer", color: C.blue, soft: C.blueSoft },
    intervention: { label: "Intervention", color: "#5a4030", soft: "#e8ddd5" },
    "required-intervention": { label: "Required Intervention", color: "#d97706", soft: "#fef3c7" },
    end: { label: "End", color: "#8b2020", soft: "#f5e0e0" },
};
