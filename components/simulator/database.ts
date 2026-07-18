import type { VitalDef, OutcomeType, LabTest, NodeSize, NodeMeta, DoseEntry } from "./types";

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

export const IMAGING_COSTS: Record<string, number> = {
    "Chest X-ray": 60,
    "Abdominal X-ray": 80,
    "CT Brain (non-contrast)": 300,
    "CT Chest": 400,
    "CT Abdomen/Pelvis": 450,
    "12-Lead ECG": 50,
    "POCUS / FAST": 60,
};

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
    "Oxygen & Airway": ["Supplemental O2 (nasal cannula)", "High flow nasal cannula", "Non-rebreather mask", "Endotracheal intubation", "BiPAP / CPAP"],
    "Analgesia & Sedation": ["Morphine IV", "Fentanyl IV", "Acetaminophen PO/IV", "Ketorolac IV"],
    Antiemetics: ["Ondansetron IV"],
    Antibiotics: ["Ceftriaxone IV", "Vancomycin IV", "Piperacillin-Tazobactam IV", "Azithromycin PO", "Metronidazole IV"],
    Diuretics: ["Furosemide IV", "Bumetanide IV", "Spironolactone PO", "Hydrochlorothiazide PO", "Mannitol IV"],
    Cardiac: ["Amiodarone IV", "Adenosine IV", "Aspirin PO", "Nitroglycerin SL", "Synchronized cardioversion", "Defibrillation"],
    Antihypertensives: ["Labetalol IV", "Nicardipine IV", "Nitroglycerin IV"],
    Vasopressors: ["Norepinephrine infusion", "Epinephrine IV push", "Dopamine infusion"],
    Respiratory: ["Albuterol nebulizer", "Ipratropium nebulizer", "Methylprednisolone IV"],
    "Anticoagulation / Reversal": ["Heparin infusion", "Vitamin K IV", "FFP transfusion", "PRBC transfusion"],
    Procedures: ["Chest tube insertion", "Central line placement", "Lumbar puncture", "Foley catheter"],
    "Electrolyte & Metabolic": ["7.5% Sodium bicarbonate IV", "Calcium gluconate 10% IV", "Regular insulin IV", "Dextrose 50% IV"],
    Disposition: ["Admit to floor", "Admit to ICU", "Transfer to OR", "Discharge home", "Transfer to another facility"],
};

export const MEDICATION_DOSES: Record<string, DoseEntry[]> = {
    "Morphine IV": [
        { label: "0.5 mg" },
        { label: "1 mg" },
        { label: "2 mg", isDefault: true },
        { label: "4 mg" },
    ],
    "Fentanyl IV": [
        { label: "25 mcg" },
        { label: "50 mcg", isDefault: true },
        { label: "100 mcg" },
    ],
    "Acetaminophen PO/IV": [
        { label: "325 mg" },
        { label: "650 mg", isDefault: true },
        { label: "1000 mg" },
    ],
    "Ketorolac IV": [
        { label: "15 mg" },
        { label: "30 mg", isDefault: true },
    ],
    "Ondansetron IV": [
        { label: "4 mg", isDefault: true },
        { label: "8 mg" },
    ],
    "Ceftriaxone IV": [
        { label: "1 g", isDefault: true },
        { label: "2 g" },
    ],
    "Vancomycin IV": [
        { label: "1 g", isDefault: true },
        { label: "1.5 g" },
        { label: "2 g" },
    ],
    "Piperacillin-Tazobactam IV": [
        { label: "3.375 g" },
        { label: "4.5 g", isDefault: true },
    ],
    "Azithromycin PO": [
        { label: "250 mg" },
        { label: "500 mg", isDefault: true },
    ],
    "Metronidazole IV": [
        { label: "500 mg", isDefault: true },
    ],
    "Furosemide IV": [
        { label: "20 mg" },
        { label: "40 mg", isDefault: true },
        { label: "80 mg" },
    ],
    "Bumetanide IV": [
        { label: "0.5 mg" },
        { label: "1 mg", isDefault: true },
        { label: "2 mg" },
    ],
    "Spironolactone PO": [
        { label: "25 mg", isDefault: true },
        { label: "50 mg" },
        { label: "100 mg" },
    ],
    "Hydrochlorothiazide PO": [
        { label: "12.5 mg" },
        { label: "25 mg", isDefault: true },
        { label: "50 mg" },
    ],
    "Amiodarone IV": [
        { label: "150 mg", isDefault: true },
        { label: "300 mg" },
    ],
    "Adenosine IV": [
        { label: "6 mg", isDefault: true },
        { label: "12 mg" },
    ],
    "Aspirin PO": [
        { label: "81 mg" },
        { label: "162 mg" },
        { label: "325 mg", isDefault: true },
    ],
    "Nitroglycerin SL": [
        { label: "0.3 mg" },
        { label: "0.4 mg", isDefault: true },
        { label: "0.6 mg" },
    ],
    "Labetalol IV": [
        { label: "10 mg" },
        { label: "20 mg", isDefault: true },
        { label: "40 mg" },
    ],
    "Epinephrine IV push": [
        { label: "0.1 mg" },
        { label: "0.5 mg", isDefault: true },
        { label: "1 mg" },
    ],
    "Albuterol nebulizer": [
        { label: "2.5 mg", isDefault: true },
        { label: "5 mg" },
    ],
    "Ipratropium nebulizer": [
        { label: "0.2 mg" },
        { label: "0.5 mg", isDefault: true },
        { label: "1 mg" },
    ],
    "Methylprednisolone IV": [
        { label: "40 mg" },
        { label: "125 mg", isDefault: true },
        { label: "250 mg" },
    ],
    "Vitamin K IV": [
        { label: "5 mg", isDefault: true },
        { label: "10 mg" },
    ],
    "Regular insulin IV": [
        { label: "5 units" },
        { label: "10 units", isDefault: true },
        { label: "15 units" },
    ],
    "Calcium gluconate 10% IV": [
        { label: "10 mL", isDefault: true },
        { label: "20 mL" },
    ],
    "7.5% Sodium bicarbonate IV": [
        { label: "25 mL" },
        { label: "50 mL", isDefault: true },
        { label: "100 mL" },
    ],
    "Dextrose 50% IV": [
        { label: "12.5 g (0.5 amp)" },
        { label: "25 g (1 amp)", isDefault: true },
    ],
};

export const OUTCOME_TYPES: OutcomeType[] = [
    { key: "improved", label: "Improved", color: C.normal, soft: C.normalSoft },
    { key: "unchanged", label: "No change", color: C.inkSoft, soft: C.paperDeep },
    { key: "deteriorated", label: "Deteriorated", color: C.orange, soft: C.orangeSoft },
    { key: "critical", label: "Critical / Death", color: C.critical, soft: C.criticalSoft },
    { key: "unlockEvent", label: "Unlock event", color: C.accent, soft: C.accentSoft },
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
    "required": { w: 240, h: 100 },
    outcome: { w: 230, h: 100 },
    end: { w: 180, h: 64 },
};

export const NODE_META: Record<string, NodeMeta> = {
    start: { label: "Case Start", color: "#787878", soft: "#f0f0f0" },
    timer: { label: "Timer", color: C.blue, soft: C.blueSoft },
    intervention: { label: "Intervention", color: "#5a4030", soft: "#e8ddd5" },
    "required": { label: "Required", color: "#d97706", soft: "#fef3c7" },
    outcome: { label: "Outcome", color: C.inkSoft, soft: C.paperDeep },
    end: { label: "End", color: "#8b2020", soft: "#f5e0e0" },
};

export const DISEASES_DB = [
    { id: "1", name: "Ulcerative colitis" },
    { id: "2", name: "Orotic Aciduria" },
    { id: "3", name: "Streptococcus pyogenes (Group A Strep) pharyngitis" },
    { id: "4", name: "Epilepsy (chronic seizure disorder)" },
    { id: "5", name: "Sickle Cell Anemia" },
    { id: "6", name: "Creutzfeldt-Jakob Disease (CJD)" },
    { id: "7", name: "Noncommunicating Hydrocephalus" },
    { id: "8", name: "Tuberous Sclerosis Complex" },
    { id: "9", name: "Invasive Lobular Carcinoma" },
    { id: "10", name: "Spinal Epidural Abscess" },
    { id: "11", name: "Porphyria Cutanea Tarda" },
    { id: "12", name: "Anterior Spinal Artery Occlusion (Anterior cord syndrome)" },
    { id: "13", name: "Delirium Tremens" },
    { id: "14", name: "Norovirus Gastroenteritis" },
    { id: "15", name: "Ischemic Stroke - Middle Cerebral Artery (MCA)" },
    { id: "16", name: "Orthostatic Hypotension" },
    { id: "17", name: "Internuclear Ophthalmoplegia" },
    { id: "18", name: "Paroxysmal Nocturnal Hemoglobinuria" },
    { id: "19", name: "Post-Traumatic Stress Disorder (PTSD)" },
    { id: "20", name: "LSD Intoxication" },
    { id: "21", name: "Anterograde Amnesia" },
    { id: "22", name: "Immune Thrombocytopenia" },
    { id: "23", name: "Metacarpal Neck Fracture (Boxer's Fracture)" },
    { id: "24", name: "Minimal Change Disease" },
    { id: "25", name: "Epidural Hematoma" },
    { id: "26", name: "Borrelia Recurrentis (Relapsing Fever)" },
    { id: "27", name: "Rubella Virus (German Measles)" },
    { id: "28", name: "Hepatitis D Virus (HDV)" },
    { id: "29", name: "Genital Herpes Simplex Virus Infection (HSV-2)" },
    { id: "30", name: "Slipped Capital Femoral Epiphysis (SCFE)" },
    { id: "31", name: "Unstable Angina" },
    { id: "32", name: "Exogenous thyrotoxicosis" },
    { id: "33", name: "Selective Mutism" },
    { id: "34", name: "Acute Intermittent Porphyria" },
    { id: "35", name: "Clonorchis sinensis (Chinese Liver Fluke)" },
    { id: "36", name: "Acute mesenteric ischemia" },
    { id: "37", name: "Alpha-1 antitrypsin deficiency" },
    { id: "38", name: "Attention Deficit Hyperactivity Disorder (ADHD)" },
    { id: "39", name: "Mycobacterium tuberculosis" },
    { id: "40", name: "Mediastinitis" },
    { id: "41", name: "Diverticulitis" },
    { id: "42", name: "Bullous Pemphigoid" },
    { id: "43", name: "Iron Deficiency Anemia" },
    { id: "44", name: "Sex Cord Thecoma" },
    { id: "45", name: "Progressive Multifocal Leukoencephalopathy (PML)" },
    { id: "46", name: "Adenomyosis" },
    { id: "47", name: "Serous Cystadenoma" },
    { id: "48", name: "Poxvirus (Molluscum Contagiosum)" },
    { id: "49", name: "Benign Prostatic Hyperplasia (BPH)" },
    { id: "50", name: "Focal Segmental Glomerulosclerosis (FSGS)" },
    { id: "51", name: "1st Degree AV Block" },
    { id: "52", name: "Carotid Sinus Hypersensitivity" },
    { id: "53", name: "Ganglion Cyst" },
    { id: "54", name: "Zollinger-Ellison syndrome" },
    { id: "55", name: "Taenia solium (Neurocysticercosis)" },
    { id: "56", name: "Opioid Withdrawal" },
    { id: "57", name: "Cardiac Tamponade" },
    { id: "58", name: "Enterococcal infection" },
    { id: "59", name: "Measles (Rubeola Virus)" },
    { id: "60", name: "Breast Fat Necrosis" },
    { id: "61", name: "Proctitis" },
    { id: "62", name: "Multiple Myeloma" },
    { id: "63", name: "Intellectual Disability" },
    { id: "64", name: "Primary (psychogenic) polydipsia" },
    { id: "65", name: "Esophageal Candidiasis" },
    { id: "66", name: "Goodpasture Syndrome" },
    { id: "67", name: "Yolk Sac Tumor" },
    { id: "68", name: "Bronchial Carcinoid Tumor" },
    { id: "69", name: "Endometrial Hyperplasia" },
    { id: "70", name: "Acromegaly" },
    { id: "71", name: "Trypanosoma brucei (African Sleeping Sickness)" },
    { id: "72", name: "Central Post-Stroke Pain Syndrome (CPSP)" },
    { id: "73", name: "Parvovirus B19" },
    { id: "74", name: "Chronic atrophic gastritis" },
    { id: "75", name: "Tetralogy of Fallot (ToF)" },
    { id: "76", name: "Pneumocystis jirovecii (PCP) pneumonia" },
    { id: "77", name: "Klinefelter Syndrome" },
    { id: "78", name: "Brenner Tumor" },
    { id: "79", name: "Atrioventricular Septal Defect (AVSD) / Endocardial Cushion Defect" },
    { id: "80", name: "Neisseria gonorrhoeae cervicitis" },
    { id: "81", name: "Type 1 Diabetes Mellitus" },
    { id: "82", name: "Pulmonary Valve Regurgitation" },
    { id: "83", name: "Premature Ventricular Contractions (PVCs)" },
    { id: "84", name: "Primary hyperaldosteronism (Conn syndrome)" },
    { id: "85", name: "Keratosis Pilaris" },
    { id: "86", name: "Anorexia Nervosa" },
    { id: "87", name: "Acute Dystonia" },
    { id: "88", name: "Superficial Spreading Melanoma" },
    { id: "89", name: "Myelodysplastic Syndrome" },
    { id: "90", name: "Follicular Lymphoma" },
    { id: "91", name: "Large Cell Carcinoma of the Lung" },
    { id: "92", name: "Intraparenchymal Hemorrhage / Intracerebral Hemorrhage / Hemorrhagic Stroke" },
    { id: "93", name: "Glomus Tumor" },
    { id: "94", name: "Posterior Urethral Valves" },
    { id: "95", name: "Central Sleep Apnea" },
    { id: "96", name: "Cluster Headache" },
    { id: "97", name: "Staphylococcus aureus cellulitis" },
    { id: "98", name: "Lead Poisoning" },
    { id: "99", name: "Endometrial Carcinoma" },
    { id: "100", name: "Meningocele" },

    { "id": "101", "name": "Squamous Cell Carcinoma of the Skin" },

    { "id": "102", "name": "Thyroid medullary carcinoma" },

    { "id": "103", "name": "Subarachnoid Hemorrhage (SAH) / Berry Aneurysm Rupture" },

    { "id": "104", "name": "Coxiella burnetii (Q Fever)" },

    { "id": "105", "name": "Hepatic hemangioma" },

    { "id": "106", "name": "Tricuspid Valve Regurgitation" },

    { "id": "107", "name": "Seborrheic Keratosis" },

    { "id": "108", "name": "Chronic Pyelonephritis" },

    { "id": "109", "name": "Hypersensitivity Pneumonitis" },

    { "id": "110", "name": "Retinopathy of Prematurity" },

    { "id": "111", "name": "Restrictive Cardiomyopathy" },

    { "id": "112", "name": "Prepatellar Bursitis" },

    { "id": "113", "name": "Squamous Cell Carcinoma of the Bladder" },

    { "id": "114", "name": "Focal Aware Seizure (Simple Partial Seizure)" },

    { "id": "115", "name": "Hidradenitis Suppurativa" },

    { "id": "116", "name": "CHARGE Syndrome" },

    { "id": "117", "name": "Post-Streptococcal Glomerulonephritis" },

    { "id": "118", "name": "Dumping Syndrome" },

    { "id": "119", "name": "Pyogenic Granuloma" },

    { "id": "120", "name": "Cingulate Herniation / Subfalcine Herniation" },

    { "id": "121", "name": "Pulmonary Embolism (PE)" },

    { "id": "122", "name": "Sick Sinus Syndrome" },

    { "id": "123", "name": "Distributive Shock (Septic Shock)" },

    { "id": "124", "name": "Primary Testicular Lymphoma" },

    { "id": "125", "name": "Hereditary Hemochromatosis" },

    { "id": "126", "name": "Trigeminal Neuralgia" },

    { "id": "127", "name": "Coccidioidomycosis" },

    { "id": "128", "name": "Nephrogenic diabetes insipidus" },

    { "id": "129", "name": "Turcot syndrome" },

    { "id": "130", "name": "Infective Endocarditis" },

    { "id": "131", "name": "Retinoblastoma" },

    { "id": "132", "name": "Actinic Keratosis" },

    { "id": "133", "name": "Truncus Arteriosus" },

    { "id": "134", "name": "Binge-Eating Disorder" },

    { "id": "135", "name": "Metabolic-Associated Fatty Liver Disease (MAFLD)" },

    { "id": "136", "name": "Poliomyelitis" },

    { "id": "137", "name": "Pneumococcal Pneumonia (Streptococcus pneumoniae)" },

    { "id": "138", "name": "Total Anomalous Pulmonary Venous Return (TAPVR)" },

    { "id": "139", "name": "Nicotine Withdrawal" },

    { "id": "140", "name": "Brugada Syndrome" },

    { "id": "141", "name": "Alcohol Withdrawal" },

    { "id": "142", "name": "Wernicke Encephalopathy" },

    { "id": "143", "name": "Congestive Heart Failure (CHF)" },

    { "id": "144", "name": "Absence Seizure" },

    { "id": "145", "name": "Acoustic Neuroma / Vestibular Schwannoma" },

    { "id": "146", "name": "Alport Syndrome" },

    { "id": "147", "name": "Complex Regional Pain Syndrome (CRPS)" },

    { "id": "148", "name": "Aortic Valve Regurgitation" },

    { "id": "149", "name": "Acute Lymphoblastic Leukemia (ALL)" },

    { "id": "150", "name": "Mucoepidermoid carcinoma" },

    { "id": "151", "name": "Achondroplasia" },

    { "id": "152", "name": "Polyomavirus (JC Virus)" },

    { "id": "153", "name": "Burkitt Lymphoma" },

    { "id": "154", "name": "Escherichia coli (E. coli) prostatitis" },

    { "id": "155", "name": "Uterine Atony" },

    { "id": "156", "name": "Primary sclerosing cholangitis (PSC)" },

    { "id": "157", "name": "Urothelial Carcinoma of the Bladder" },

    { "id": "158", "name": "Renal Cell Carcinoma" },

    { "id": "159", "name": "Kidney Stones (Nephrolithiasis)" },

    { "id": "160", "name": "Cystic Fibrosis" },

    { "id": "161", "name": "Necrotizing enterocolitis" },

    { "id": "162", "name": "Hemophilia B (Christmas disease)" },

    { "id": "163", "name": "Dermatomyositis" },

    { "id": "164", "name": "Melanocytic Nevus" },

    { "id": "165", "name": "Thromboangiitis Obliterans (Buerger's Disease)" },

    { "id": "166", "name": "Embryonal Carcinoma" },

    { "id": "167", "name": "Erythema Nodosum" },

    { "id": "168", "name": "Holiday Heart Syndrome (Alcohol-Induced Atrial Fibrillation)" },

    { "id": "169", "name": "Radial Neuropathy (Saturday Night Palsy)" },

    { "id": "170", "name": "Hemolytic Uremic Syndrome (Enterohemorrhagic E. coli / EHEC)" },

    { "id": "171", "name": "Peripheral Artery Disease (PAD)" },

    { "id": "172", "name": "Squamous Cell Carcinoma of the Lung" },

    { "id": "173", "name": "Anemia of Chronic Disease" },

    { "id": "174", "name": "Schizophreniform Disorder" },

    { "id": "175", "name": "Retinitis Pigmentosa" },

    { "id": "176", "name": "Benign Paroxysmal Positional Vertigo (BPPV)" },

    { "id": "177", "name": "Insulinoma" },

    { "id": "178", "name": "Otitis Externa" },

    { "id": "179", "name": "Asbestosis" },

    { "id": "180", "name": "Mammary Duct Ectasia" },

    { "id": "181", "name": "Gigantism" },

    { "id": "182", "name": "Toxic Megacolon" },

    { "id": "183", "name": "Human Papillomavirus (HPV) Laryngeal Papillomatosis" },

    { "id": "184", "name": "Atrial Septal Defect (ASD)" },

    { "id": "185", "name": "Avoidant Personality Disorder" },

    { "id": "186", "name": "Dyslexia" },

    { "id": "187", "name": "Hepatocellular carcinoma (HCC)" },

    { "id": "188", "name": "Turner Syndrome" },

    { "id": "189", "name": "Mitral Valve Prolapse (MVP)" },

    { "id": "190", "name": "Post-MI Papillary Muscle Rupture" },

    { "id": "191", "name": "Menopause" },

    { "id": "192", "name": "Roseola (HHV-6)" },

    { "id": "193", "name": "Phyllodes Tumor" },

    { "id": "194", "name": "Acute pancreatitis" },

    { "id": "195", "name": "Gestational Hypertension" },

    { "id": "196", "name": "Loa loa (African Eye Worm) Infection" },

    { "id": "197", "name": "Conversion Disorder" },

    { "id": "198", "name": "Thyroid papillary carcinoma" },

    { "id": "199", "name": "Fibromyalgia" },

    { "id": "200", "name": "Hepatic carcinoid tumor (Carcinoid Syndrome)" },

    { "id": "201", "name": "Mycosis fungoides (Cutaneous T-Cell Lymphoma)" },

    { "id": "202", "name": "Familial Chylomicronemia Syndrome (Type 1 dyslipidemia)" },

    { "id": "203", "name": "Interventricular Septal Rupture" },

    { "id": "204", "name": "Primary adrenal insufficiency (Addison's Disease)" },

    { "id": "205", "name": "Stevens-Johnson Syndrome (SJS)" },

    { "id": "206", "name": "Acute Promyelocytic Leukemia (APL)" },

    { "id": "207", "name": "Crigler-Najjar syndrome type 1" },

    { "id": "208", "name": "Anencephaly" },

    { "id": "209", "name": "Chronic Obstructive Pulmonary Disease (COPD)" },

    { "id": "210", "name": "Hepatitis A Virus (HAV)" },

    { "id": "211", "name": "Vitiligo" },

    { "id": "212", "name": "Takayasu Arteritis" },

    { "id": "213", "name": "Broken-heart syndrome (takotsubo cardiomyopathy)" },

    { "id": "214", "name": "Infantile Strawberry Hemangioma" },

    { "id": "215", "name": "Esophageal Adenocarcinoma" },

    { "id": "216", "name": "Mycoplasma pneumoniae" },

    { "id": "217", "name": "Midgut Volvulus" },

    { "id": "218", "name": "Testicular Torsion" },

    { "id": "219", "name": "Extramammary Paget Disease" },

    { "id": "220", "name": "Biliary colic / Cholelithiasis" },

    { "id": "221", "name": "Pilocytic Astrocytoma" },

    { "id": "222", "name": "Allergic Conjunctivitis" },

    { "id": "223", "name": "Syringomyelia" },

    { "id": "224", "name": "Bernard-Soulier Syndrome" },

    { "id": "225", "name": "Choledocholithiasis / Ascending Cholangitis" },

    { "id": "226", "name": "Illness Anxiety Disorder" },

    { "id": "227", "name": "Diffuse esophageal spasm (DES)" },

    { "id": "228", "name": "Medial Epicondylitis / Tendonitis (Golfer's Elbow)" },

    { "id": "229", "name": "Status Epilepticus" },

    { "id": "230", "name": "Glucose-6-phosphate dehydrogenase (G6PD) Deficiency" },

    { "id": "231", "name": "Bronchiectasis" },

    { "id": "232", "name": "Leptospirosis (Leptospira interrogans)" },

    { "id": "233", "name": "Pleomorphic adenoma" },

    { "id": "234", "name": "Crigler-Najjar syndrome type 2" },

    { "id": "235", "name": "Rosacea" },

    { "id": "236", "name": "Fanconi Syndrome / Proximal Renal Tubular Acidosis (RTA Type 2)" },

    { "id": "237", "name": "Chondroblastoma" },

    { "id": "238", "name": "Tinea Capitis" },

    { "id": "239", "name": "Nicotine Intoxication" },

    { "id": "240", "name": "Hemangioblastoma" },

    { "id": "241", "name": "Anterior Uveitis (Iritis)" },

    { "id": "242", "name": "Central Cord Syndrome (CCS)" },

    { "id": "243", "name": "Hypnopompic Hallucinations" },

    { "id": "244", "name": "Substance Use Disorder" },

    { "id": "245", "name": "Intermittent Explosive Disorder" },

    { "id": "246", "name": "Thyroglossal duct cyst" },

    { "id": "247", "name": "Peptic ulcer disease" },

    { "id": "248", "name": "Down Syndrome (Trisomy 21)" },

    { "id": "249", "name": "Lewy Body Dementia" },

    { "id": "250", "name": "Acanthosis Nigricans" },

    { "id": "251", "name": "Inflammatory Carcinoma of the Breast" },

    { "id": "252", "name": "Amyotrophic Lateral Sclerosis (ALS)" },

    { "id": "253", "name": "Hereditary Spherocytosis" },

    { "id": "254", "name": "Reye syndrome" },

    { "id": "255", "name": "Mucor and Rhizopus spp. (Mucormycosis)" },

    { "id": "256", "name": "Branchial Cleft Cyst" },

    { "id": "257", "name": "Polycystic Ovary Syndrome (PCOS)" },

    { "id": "258", "name": "Neuropathic Ulcer / Diabetic Foot Ulcer" },

    { "id": "259", "name": "Malingering" },

    { "id": "260", "name": "Biliary atresia" },

    { "id": "261", "name": "Ischemic Stroke - Posterior Cerebral Artery (PCA)" },

    { "id": "262", "name": "Lacunar Stroke" },

    { "id": "263", "name": "Benzodiazepine Withdrawal" },

    { "id": "264", "name": "Pancreatic adenocarcinoma" },

    { "id": "265", "name": "Pre-Renal Acute Kidney Injury (AKI)" },

    { "id": "266", "name": "Neonatal Intraventricular Hemorrhage" },

    { "id": "267", "name": "Atelectasis" },

    { "id": "268", "name": "Erectile Dysfunction" },

    { "id": "269", "name": "Cytomegalovirus (CMV)" },

    { "id": "270", "name": "Eosinophilic Esophagitis" },

    { "id": "271", "name": "Non-ST Elevation Myocardial Infarction (NSTEMI)" },

    { "id": "272", "name": "Kartagener Syndrome / Primary Ciliary Dyskinesia" },

    { "id": "273", "name": "Testicular Sertoli Cell Tumor" },

    { "id": "274", "name": "Cryptosporidiosis" },

    { "id": "275", "name": "Lactose intolerance" },

    { "id": "276", "name": "Botulism (Clostridium botulinum)" },

    { "id": "277", "name": "Diamond-Blackfan Anemia" },

    { "id": "278", "name": "Portal hypertension" },

    { "id": "279", "name": "Coarctation of the Aorta" },

    { "id": "280", "name": "Obsessive-Compulsive Personality Disorder (OCPD)" },

    { "id": "281", "name": "Central diabetes insipidus" },

    { "id": "282", "name": "Congenital Muscular Torticollis" },

    { "id": "283", "name": "Epididymitis" },

    { "id": "284", "name": "Tic Disorder" },

    { "id": "285", "name": "Pityriasis / Tinea Versicolor" },

    { "id": "286", "name": "Whipple disease" },

    { "id": "287", "name": "Paget Disease of the Breast / Mammary Paget Disease" },

    { "id": "288", "name": "IgA Vasculitis (Henoch-Schönlein Purpura)" },

    { "id": "289", "name": "3rd Degree AV Block (Complete Heart Block)" },

    { "id": "290", "name": "Scleroderma (Systemic Sclerosis)" },

    { "id": "291", "name": "Yersinia pestis (Bubonic Plague)" },

    { "id": "292", "name": "Osteomyelitis" },

    { "id": "293", "name": "Pineal Gland Tumor / Parinaud syndrome" },

    { "id": "294", "name": "Cold Autoimmune Hemolytic Anemia / Cold Agglutinin Syndrome" },

    { "id": "295", "name": "Hairy Cell Leukemia" },

    { "id": "296", "name": "Varicella Zoster Virus (Chickenpox)" },

    { "id": "297", "name": "Rotator Cuff Tear" },

    { "id": "298", "name": "Drug-Induced Hemolytic Anemia" },

    { "id": "299", "name": "Angiosarcoma" },

    { "id": "300", "name": "Psoas Abscess" },

    { "id": "301", "name": "Psoriasis Vulgaris (Plaque Psoriasis)" },

    { "id": "302", "name": "Tricuspid Valve Stenosis" },

    { "id": "303", "name": "Stable Angina" },

    { "id": "304", "name": "CN III Palsy (Oculomotor Palsy) / Posterior Communicating Artery (PCOM) Aneurysm" },

    { "id": "305", "name": "Osteitis Deformans (Paget Disease)" },

    { "id": "306", "name": "Prostatic adenocarcinoma" },

    { "id": "307", "name": "Parainfluenza Virus (Croup)" },

    { "id": "308", "name": "Vesicoureteral Reflux" },

    { "id": "309", "name": "Essential Hypertension / Primary Hypertension" },

    { "id": "310", "name": "Torus (Buckle) Fracture" },

    { "id": "311", "name": "Pes Anserinus Pain Syndrome" },

    { "id": "312", "name": "Eosinophilic Granulomatosis with Polyangiitis (Churg-Strauss Syndrome)" },

    { "id": "313", "name": "Entamoeba Histolytica" },

    { "id": "314", "name": "Trichomoniasis (Trichomonas Vaginalis)" },

    { "id": "315", "name": "Hunter Syndrome / Mucopolysaccharidosis Type II" },

    { "id": "316", "name": "Campylobacteriosis (Campylobacter jejuni)" },

    { "id": "317", "name": "Lobular Carcinoma In Situ (LCIS)" },

    { "id": "318", "name": "D-Transposition of the Great Vessels" },

    { "id": "319", "name": "Hairy Leukoplakia" },

    { "id": "320", "name": "Vocal Cord Nodules" },

    { "id": "321", "name": "Verruca Vulgaris / Cutaneous Wart" },

    { "id": "322", "name": "Sclerosing Adenosis of the Breast" },

    { "id": "323", "name": "Polymyositis" },

    { "id": "324", "name": "Dengue Virus" },

    { "id": "325", "name": "Orchitis" },

    { "id": "326", "name": "Migraine Headache" },

    { "id": "327", "name": "Immature Teratoma" },

    { "id": "328", "name": "Melasma" },

    { "id": "329", "name": "WAGR Syndrome / WAGR Complex" },

    { "id": "330", "name": "ST Elevation Myocardial Infarction (STEMI)" },

    { "id": "331", "name": "Myotonic Dystrophy" },

    { "id": "332", "name": "Schizophrenia" },

    { "id": "333", "name": "Hashimoto Thyroiditis" },

    { "id": "334", "name": "Major Depressive Disorder (MDD)" },

    { "id": "335", "name": "Hypertensive Retinopathy" },

    { "id": "336", "name": "Neisseria meningitidis Meningitis / Meningococcal Meningitis" },

    { "id": "337", "name": "Monoclonal Gammopathy of Undetermined Significance" },

    { "id": "338", "name": "Blastomycosis" },

    { "id": "339", "name": "Human Immunodeficiency Virus (HIV)" },

    { "id": "340", "name": "Invasive Aspergillosis (IPA)" },

    { "id": "341", "name": "Pituitary Apoplexy" },

    { "id": "342", "name": "Placenta Accreta" },

    { "id": "343", "name": "Bartter Syndrome" },

    { "id": "344", "name": "Ewing Sarcoma" },

    { "id": "345", "name": "Ischemic Stroke - Anterior Inferior Cerebellar Artery (AICA)" },

    { "id": "346", "name": "Traumatic Pneumothorax" },

    { "id": "347", "name": "Pinguecula" },

    { "id": "348", "name": "Haemophilus ducreyi (Chancroid)" },

    { "id": "349", "name": "West Nile Virus" },

    { "id": "350", "name": "Staphylococcus aureus Impetigo" },

    { "id": "351", "name": "Deep Vein Thrombosis (DVT)" },

    { "id": "352", "name": "Legionnaires Disease (Legionella pneumophila)" },

    { "id": "353", "name": "Open Globe Injury" },

    { "id": "354", "name": "Fanconi Anemia" },

    { "id": "355", "name": "Fragile X Syndrome" },

    { "id": "356", "name": "Secondary Biliary Cirrhosis" },

    { "id": "357", "name": "Osteoid Osteoma" },

    { "id": "358", "name": "Ventricular Tachycardia" },

    { "id": "359", "name": "Cryptococcus neoformans" },

    { "id": "360", "name": "Primary Dysmenorrhea" },

    { "id": "361", "name": "Neuroleptic Malignant Syndrome (NMS)" },

    { "id": "362", "name": "Toxoplasmosis (Toxoplasma gondii)" },

    { "id": "363", "name": "Acute Tubular Necrosis (ATN)" },

    { "id": "364", "name": "Charcot-Marie-Tooth Disease" },

    { "id": "365", "name": "Femoral Neck Fracture" },

    { "id": "366", "name": "Intussusception" },

    { "id": "367", "name": "Western Equine Encephalitis Virus" },

    { "id": "368", "name": "Tabes Dorsalis" },

    { "id": "369", "name": "De Quervain Tenosynovitis" },

    { "id": "370", "name": "Autoimmune Gastritis / Pernicious Anemia" },

    { "id": "371", "name": "Partial Hydatidiform Mole / Molar Pregnancy" },

    { "id": "372", "name": "Seborrheic Dermatitis" },

    { "id": "373", "name": "Idiopathic Intracranial Hypertension (Pseudotumor Cerebri)" },

    { "id": "374", "name": "Major Depressive Disorder with Psychotic Features" },

    { "id": "375", "name": "Cataract" },

    { "id": "376", "name": "Classic Congenital Adrenal Hyperplasia (21-Hydroxylase Deficiency)" },

    { "id": "377", "name": "Wet Macular Degeneration" },

    { "id": "378", "name": "Membranous Nephropathy" },

    { "id": "379", "name": "Narcissistic Personality Disorder" },

    { "id": "380", "name": "Dressler Syndrome" },

    { "id": "381", "name": "Persistent Depressive Disorder (PDD) / Dysthymic disorder" },

    { "id": "382", "name": "Rabies Virus" },

    { "id": "383", "name": "Lissencephaly" },

    { "id": "384", "name": "Mucinous Cystadenoma" },

    { "id": "385", "name": "Staphylococcal Scalded Skin Syndrome" },

    { "id": "386", "name": "Hydrocele" },

    { "id": "387", "name": "Intrauterine Adhesions (Asherman Syndrome)" },

    { "id": "388", "name": "Inclusion Body Myositis" },

    { "id": "389", "name": "Ankylosing Spondylitis" },

    { "id": "390", "name": "Budd-Chiari syndrome" },

    { "id": "391", "name": "Cervical Invasive Carcinoma" },

    { "id": "392", "name": "Borderline Personality Disorder" },

    { "id": "393", "name": "CN IV Palsy" },

    { "id": "394", "name": "Waterhouse-Friderichsen syndrome" },

    { "id": "395", "name": "Coal Worker's Pneumoconiosis" },

    { "id": "396", "name": "Cushing disease" },

    { "id": "397", "name": "Hepatitis C Virus (HCV)" },

    { "id": "398", "name": "Korsakoff Syndrome" },

    { "id": "399", "name": "Alcoholic cirrhosis" },

    { "id": "400", "name": "Rotor syndrome" },

    { "id": "401", "name": "Behçet Disease / Behcet Disease" },

    { "id": "402", "name": "Alcoholic hepatitis" },

    { "id": "403", "name": "Ectopic thyroid (lingual thyroid)" },

    { "id": "404", "name": "Peyronie Disease" },

    { "id": "405", "name": "Charcot-Bouchard Microaneurysm" },

    { "id": "406", "name": "Peripheral Vertigo" },

    { "id": "407", "name": "Refeeding Syndrome" },

    { "id": "408", "name": "Depression with Atypical Features" },

    { "id": "409", "name": "Secondary Spontaneous Pneumothorax" },

    { "id": "410", "name": "Gender Dysphoria" },

    { "id": "411", "name": "Atraumatic Splenic Rupture" },

    { "id": "412", "name": "Ventricular Fibrillation (VF)" },

    { "id": "413", "name": "Dilated Cardiomyopathy" },

    { "id": "414", "name": "Renal Oncocytoma" },

    { "id": "415", "name": "Acute Respiratory Distress Syndrome (ARDS)" },

    { "id": "416", "name": "Familial adenomatous polyposis" },

    { "id": "417", "name": "Phantom Limb Pain" },

    { "id": "418", "name": "Proliferative Diabetic Retinopathy" },

    { "id": "419", "name": "Ascaris lumbricoides" },

    { "id": "420", "name": "Multiple Sclerosis" },

    { "id": "421", "name": "Sjögren's Syndrome" },

    { "id": "422", "name": "Glanzmann Thrombasthenia" },

    { "id": "423", "name": "Pasteurella multocida" },

    { "id": "424", "name": "Mixed Cryoglobulinemia" },

    { "id": "425", "name": "Ex vacuo Ventriculomegaly" },

    { "id": "426", "name": "Essential Thrombocythemia" },

    { "id": "427", "name": "Leishmania spp. (Leishmaniasis)" },

    { "id": "428", "name": "Serous Carcinoma" },

    { "id": "429", "name": "Toxocara canis (Visceral Larva Migrans)" },

    { "id": "430", "name": "Basal Cell Carcinoma" },

    { "id": "431", "name": "Osteoarthritis" },

    { "id": "432", "name": "Clostridium tetani" },

    { "id": "433", "name": "Social Anxiety Disorder" },

    { "id": "434", "name": "Bartonella henselae (Cat Scratch Disease)" },

    { "id": "435", "name": "Tinea Cruris (Jock Itch)" },

    { "id": "436", "name": "Gout (Hyperuricemia)" },

    { "id": "437", "name": "Todd's Paralysis" },

    { "id": "438", "name": "Chronic mesenteric ischemia" },

    { "id": "439", "name": "Non-megaloblastic Anemia" },

    { "id": "440", "name": "Atonic Seizure" },

    { "id": "441", "name": "Superficial (First Degree) Burn" },

    { "id": "442", "name": "Premature Atrial Contractions (PACs)" },

    { "id": "443", "name": "Treponema pallidum (Syphilis)" },

    { "id": "444", "name": "Renal Papillary Necrosis" },

    { "id": "445", "name": "Paramyxovirus (Mumps)" },

    { "id": "446", "name": "Sex Cord Fibroma" },

    { "id": "447", "name": "Glycogen storage disease II (Pompe Disease)" },

    { "id": "448", "name": "Beta Thalassemia" },

    { "id": "449", "name": "Asthma" },

    { "id": "450", "name": "Cavernous Sinus Syndrome" },

    { "id": "451", "name": "Trichotillomania" },

    { "id": "452", "name": "Right Bundle Branch Block (RBBB)" },

    { "id": "453", "name": "Partial-Thickness (Second Degree) Burn" },

    { "id": "454", "name": "Poliovirus" },

    { "id": "455", "name": "Bacillus cereus" },

    { "id": "456", "name": "Dandy-Walker Malformation" },

    { "id": "457", "name": "Marginal Zone Lymphoma" },

    { "id": "458", "name": "Mixed Connective Tissue Disease (MCTD)" },

    { "id": "459", "name": "Osmotic Demyelination Syndrome / Central Pontine Myelinolysis" },

    { "id": "460", "name": "Cryptogenic Organizing Pneumonia (COP)" },

    { "id": "461", "name": "Acute adrenal insufficiency" },

    { "id": "462", "name": "Autism Spectrum Disorder (ASD)" },

    { "id": "463", "name": "Ectopic Pregnancy" },

    { "id": "464", "name": "Venous Insufficiency" },

    { "id": "465", "name": "Sarcoptes scabiei (Scabies)" },

    { "id": "466", "name": "Vulvar Carcinoma" },

    { "id": "467", "name": "Factitious Disorder Imposed on Self" },

    { "id": "468", "name": "Osteosarcoma" },

    { "id": "469", "name": "Erysipelas" },

    { "id": "470", "name": "Mesothelioma" },

    { "id": "471", "name": "Duplex Collecting System" },

    { "id": "472", "name": "Microscopic colitis" },

    { "id": "473", "name": "Dermoid Cyst" },

    { "id": "474", "name": "Ventricular Septal Defect (VSD)" },

    { "id": "475", "name": "Plantar Fasciitis" },

    { "id": "476", "name": "Ischemic Priapism" },

    { "id": "477", "name": "Trichuris trichiura (Whipworm)" },

    { "id": "478", "name": "Somatostatinoma" },

    { "id": "479", "name": "Tertiary hyperparathyroidism" },

    { "id": "480", "name": "Malrotation" },

    { "id": "481", "name": "Celiac disease" },

    { "id": "482", "name": "Hirschsprung disease" },

    { "id": "483", "name": "Neurofibromatosis Type I" },

    { "id": "484", "name": "Pacemaker Dysfunction" },

    { "id": "485", "name": "Strongyloides stercoralis" },

    { "id": "486", "name": "Varicella Zoster Virus (Shingles)" },

    { "id": "487", "name": "Polymyalgia Rheumatica (PMR)" },

    { "id": "488", "name": "Mucosal polyps" },

    { "id": "489", "name": "Rheumatic Heart Disease" },

    { "id": "490", "name": "Chikungunya Virus" },

    { "id": "491", "name": "Corynebacterium diphtheriae" },

    { "id": "492", "name": "Vulvovaginal candidiasis (Yeast infection)" },

    { "id": "493", "name": "Pituitary Adenoma" },

    { "id": "494", "name": "Septic Arthritis" },

    { "id": "495", "name": "Yellow Fever" },

    { "id": "496", "name": "Ischemic Stroke - Anterior Spinal Artery" },

    { "id": "497", "name": "Acute Pyelonephritis" },

    { "id": "498", "name": "Ovarian Corpus Luteal Cyst" },

    { "id": "499", "name": "5α-reductase Deficiency" },

    { "id": "500", "name": "Yersinia enterocolitica" },

    { "id": "501", "name": "Cocaine Intoxication" },

    { "id": "502", "name": "Colorectal cancer" },

    { "id": "503", "name": "Paralytic Ileus (Ogilvie Syndrome)" },

    { "id": "504", "name": "Angle-closure Glaucoma" },

    { "id": "505", "name": "Nonproliferative Diabetic Retinopathy" },

    { "id": "506", "name": "Alpha-Thalassemia" },

    { "id": "507", "name": "Sideroblastic Anemia" },

    { "id": "508", "name": "Factitious Disorder Imposed on Another" },

    { "id": "509", "name": "Placental Abruption" },

    { "id": "510", "name": "Medulloblastoma" },

    { "id": "511", "name": "Serotonin Syndrome" },

    { "id": "512", "name": "Dermatofibroma" },

    { "id": "513", "name": "Eastern Equine Encephalitis Virus" },

    { "id": "514", "name": "Diffuse Cortical Necrosis" },

    { "id": "515", "name": "Spina Bifida Occulta" },

    { "id": "516", "name": "Iodine-excess hypothyroidism / Wolff-Chaikoff effect" },

    { "id": "517", "name": "Chronic pancreatitis" },

    { "id": "518", "name": "Clostridioides difficile gastroenteritis" },

    { "id": "519", "name": "Patellofemoral Syndrome" },

    { "id": "520", "name": "Sex Cord Granulosa Cell Tumor" },

    { "id": "521", "name": "Benzodiazepine Intoxication" },

    { "id": "522", "name": "Staphylococcus saprophyticus" },

    { "id": "523", "name": "Volvulus" },

    { "id": "524", "name": "Mucinous Carcinoma" },

    { "id": "525", "name": "Thyroid adenoma" },

    { "id": "526", "name": "Acute Limb Ischemia" },

    { "id": "527", "name": "Clostridium perfringens necrotizing fasciitis" },

    { "id": "528", "name": "Coronavirus (Common Cold Coronaviruses)" },

    { "id": "529", "name": "Splenic Abscess" },

    { "id": "530", "name": "Pseudofolliculitis Barbae" },

    { "id": "531", "name": "Megaloblastic Anemia (Vitamin B12 Deficiency)" },

    { "id": "532", "name": "Myocarditis" },

    { "id": "533", "name": "Esophageal perforation (Boerhaave Syndrome)" },

    { "id": "534", "name": "MEN2B" },

    { "id": "535", "name": "Eisenmenger Syndrome" },

    { "id": "536", "name": "Conduction Aphasia" },

    { "id": "537", "name": "Costochondritis" },

    { "id": "538", "name": "Anomalous Left Coronary Artery" },

    { "id": "539", "name": "Potter Sequence" },

    { "id": "540", "name": "Cervical Myelopathy" },

    { "id": "541", "name": "Body Dysmorphic Disorder" },

    { "id": "542", "name": "Depersonalization/Derealization Disorder" },

    { "id": "543", "name": "Supine Hypotensive Syndrome" },

    { "id": "544", "name": "Myeloschisis" },

    { "id": "545", "name": "Atopic Dermatitis (Eczema)" },

    { "id": "546", "name": "Retinal Artery Occlusion" },

    { "id": "547", "name": "Graves disease" },

    { "id": "548", "name": "Prolonged QT Syndrome" },

    { "id": "549", "name": "Acute Cystitis" },

    { "id": "550", "name": "Obesity Hypoventilation Syndrome" },

    { "id": "551", "name": "Developmental Dysplasia of the Hip" },

    { "id": "552", "name": "Pseudomonas aeruginosa infection (non-disseminated)" },

    { "id": "553", "name": "Cholecystitis" },

    { "id": "554", "name": "Factor 5 Leiden" },

    { "id": "555", "name": "Normal Pressure Hydrocephalus" },

    { "id": "556", "name": "Schizoid Personality Disorder" },

    { "id": "557", "name": "Lithium Toxicity" },

    { "id": "558", "name": "Ischemic Stroke - Anterior Cerebral Artery (ACA)" },

    { "id": "559", "name": "Spinal Muscular Atrophy (Werdnig-Hoffmann Disease)" },

    { "id": "560", "name": "Full-Thickness (Third Degree) Burn" },

    { "id": "561", "name": "Disseminated Intravascular Coagulation (DIC)" },

    { "id": "562", "name": "Invasive Ductal Carcinoma" },

    { "id": "563", "name": "Dry Macular Degeneration" },

    { "id": "564", "name": "Sialolithiasis" },

    { "id": "565", "name": "Tinea Corporis (Ringworm)" },

    { "id": "566", "name": "Chronic Bronchitis" },

    { "id": "567", "name": "Sialadenitis" },

    { "id": "568", "name": "Glycogen storage disease III (Cori Disease)" },

    { "id": "569", "name": "Frontotemporal Dementia" },

    { "id": "570", "name": "Idiopathic Pulmonary Fibrosis" },

    { "id": "571", "name": "Vaginal Sarcoma Botryoides" },

    { "id": "572", "name": "Waldenstrom Macroglobulinemia" },

    { "id": "573", "name": "Streptococcus bovis" },

    { "id": "574", "name": "Oligodendroglioma" },

    { "id": "575", "name": "Ebstein Anomaly" },

    { "id": "576", "name": "Chlamydia trachomatis cervicitis" },

    { "id": "577", "name": "Myoclonic Seizure" },

    { "id": "578", "name": "Cherry Angioma" },

    { "id": "579", "name": "Tonic Seizure" },

    { "id": "580", "name": "Dissociative Amnesia" },

    { "id": "581", "name": "Echinococcus granulosus (Hydatid Disease)" },

    { "id": "582", "name": "Clavicle Fractures" },

    { "id": "583", "name": "Uremic Platelet Dysfunction" },

    { "id": "584", "name": "Rheumatoid Arthritis" },

    { "id": "585", "name": "Liddle Syndrome" },

    { "id": "586", "name": "Panic Disorder" },

    { "id": "587", "name": "Juvenile polyposis syndrome" },

    { "id": "588", "name": "Immunoglobulin Light Chain / Primary Amyloidosis (AL)" },

    { "id": "589", "name": "Hemophilia C" },

    { "id": "590", "name": "Neuroblastoma" },

    { "id": "591", "name": "Membranoproliferative Glomerulonephritis" },

    { "id": "592", "name": "Thyroid follicular carcinoma" },

    { "id": "593", "name": "Angiodysplasia" },

    { "id": "594", "name": "Listeria monocytogenes Meningitis" },

    { "id": "595", "name": "Diabetic ketoacidosis (DKA)" },

    { "id": "596", "name": "Gastric cancer" },

    { "id": "597", "name": "Human Papilloma Virus (HPV) Condyloma Acuminata" },

    { "id": "598", "name": "Zenker diverticulum" },

    { "id": "599", "name": "Delusional Disorder" },

    { "id": "600", "name": "2nd Degree AV Block Type II (Mobitz II)" },

    { "id": "601", "name": "Anal Fissures" },

    { "id": "602", "name": "Rhinovirus (Common Cold)" },

    { "id": "603", "name": "Limited Scleroderma (CREST syndrome)" },

    { "id": "604", "name": "Lateral Epicondylitis / Tendonitis (Tennis Elbow)" },

    { "id": "605", "name": "Postpartum Psychosis" },

    { "id": "606", "name": "Paroxysmal Supraventricular Tachycardia (PSVT)" },

    { "id": "607", "name": "Familial Hypercholesterolemia (Type 2a dyslipidemia)" },

    { "id": "608", "name": "Psoriatic Arthritis" },

    { "id": "609", "name": "Anaplasma spp. (Anaplasmosis)" },

    { "id": "610", "name": "Rhinosinusitis" },

    { "id": "611", "name": "Myasthenia Gravis" },

    { "id": "612", "name": "Venous Sinus Thrombosis" },

    { "id": "613", "name": "Trypanosoma cruzi (Chagas Disease)" },

    { "id": "614", "name": "Pituitary prolactinoma" },

    { "id": "615", "name": "MEN2A" },

    { "id": "616", "name": "Chronic Myelogenous Leukemia" },

    { "id": "617", "name": "Temporomandibular Disorders" },

    { "id": "618", "name": "Squamous cell carcinoma of the esophagus" },

    { "id": "619", "name": "Adult T-Cell Lymphoma" },

    { "id": "620", "name": "Broca's (Expressive) Aphasia" },

    { "id": "621", "name": "Medial Tibial Stress Syndrome" },

    { "id": "622", "name": "Ovarian Torsion" },

    { "id": "623", "name": "Bovine Spongiform Encephalopathy (Mad Cow Disease)" },

    { "id": "624", "name": "Small Cell Lung Carcinoma" },

    { "id": "625", "name": "Hypnagogic Hallucinations" },

    { "id": "626", "name": "Sarcoidosis" },

    { "id": "627", "name": "Subacute granulomatous thyroiditis / de Quervain" },

    { "id": "628", "name": "Schizotypal Personality Disorder" },

    { "id": "629", "name": "Cerebral Palsy" },

    { "id": "630", "name": "Dependent Personality Disorder" },

    { "id": "631", "name": "Eclampsia" },

    { "id": "632", "name": "Toxic multinodal goiter" },

    { "id": "633", "name": "Bulimia Nervosa" },

    { "id": "634", "name": "Pulmonary Valve Stenosis" },

    { "id": "635", "name": "Hepatitis B Virus (HBV)" },

    { "id": "636", "name": "Focal nodular hyperplasia" },

    { "id": "637", "name": "Diffuse Axonal Injury" },

    { "id": "638", "name": "Salmonella typhi" },

    { "id": "639", "name": "Cyanide Poisoning" },

    { "id": "640", "name": "Female Hypergonadotrophic Hypogonadism" },

    { "id": "641", "name": "Ulnar Neuropathy (Cubital Tunnel Syndrome)" },

    { "id": "642", "name": "Naegleria fowleri" },

    { "id": "643", "name": "Pseudoachalasia" },

    { "id": "644", "name": "Human Herpesvirus 8 (Kaposi Sarcoma)" },

    { "id": "645", "name": "Chordae Tendineae Rupture" },

    { "id": "646", "name": "Small bowel obstruction" },

    { "id": "647", "name": "Complete Hydatidiform Mole / Molar Pregnancy" },

    { "id": "648", "name": "Nonsecreting pituitary adenoma" },

    { "id": "649", "name": "Staphylococcus epidermidis" },

    { "id": "650", "name": "Autosomal Dominant Tubulointerstitial Kidney Disease" },

    { "id": "651", "name": "Paraganglioma" },

    { "id": "652", "name": "Bartholin Cyst/Abscess" },

    { "id": "653", "name": "Chondrosarcoma" },

    { "id": "654", "name": "Onchocerca volvulus (River Blindness)" },

    { "id": "655", "name": "Irritable bowel syndrome" },

    { "id": "656", "name": "Delirium" },

    { "id": "657", "name": "Tension-type Headache" },

    { "id": "658", "name": "Cushing syndrome" },

    { "id": "659", "name": "Antiphospholipid Syndrome" },

    { "id": "660", "name": "Calcium Pyrophosphate Deposition Disease (Pseudogout)" },

    { "id": "661", "name": "Ancylostoma spp., Necator americanus (Hookworm)" },

    { "id": "662", "name": "Pancreatic insufficiency" },

    { "id": "663", "name": "Autoimmune hepatitis" },

    { "id": "664", "name": "Haemophilus influenzae epiglottitis" },

    { "id": "665", "name": "HIV-associated Dementia" },

    { "id": "666", "name": "Barbiturate Intoxication" },

    { "id": "667", "name": "Hydronephrosis" },

    { "id": "668", "name": "Rapidly Progressive Glomerulonephritis (RPGN)" },

    { "id": "669", "name": "Giant Cell Tumor" },

    { "id": "670", "name": "Cutaneous Small-Vessel Vasculitis" },

    { "id": "671", "name": "Hepatic angiosarcoma" },

    { "id": "672", "name": "Lumbar disc herniation" },

    { "id": "673", "name": "Epithelial Hyperplasia of the Breast" },

    { "id": "674", "name": "Hepatic encephalopathy" },

    { "id": "675", "name": "Benign neonatal hyperbilirubinemia" },

    { "id": "676", "name": "Aromatase deficiency" },

    { "id": "677", "name": "Secondary hyperaldosteronism" },

    { "id": "678", "name": "Retinal Detachment" },

    { "id": "679", "name": "Radial Head Subluxation (Nursemaid's Elbow)" },

    { "id": "680", "name": "Ovarian Follicular Cyst" },

    { "id": "681", "name": "Plummer-Vinson syndrome" },

    { "id": "682", "name": "Barrett esophagus" },

    { "id": "683", "name": "Swyer Syndrome" },

    { "id": "684", "name": "Tricyclic Antidepressant Toxicity" },

    { "id": "685", "name": "Hemophilia A" },

    { "id": "686", "name": "Antipsychotic-induced hyperprolactinemia" },

    { "id": "687", "name": "Osteoblastoma" },

    { "id": "688", "name": "Pediculus humanus and Phthirus pubis (Lice)" },

    { "id": "689", "name": "Hypertrophic Cardiomyopathy (HCM)" },

    { "id": "690", "name": "Paracoccidioidomycosis" },

    { "id": "691", "name": "Nonthyroidal illness syndrome / euthyroid sick syndrome" },

    { "id": "692", "name": "Autosomal Dominant Polycystic Kidney Disease (ADPKD)" },

    { "id": "693", "name": "Atherosclerosis" },

    { "id": "694", "name": "Rickettsia rickettsii (Rocky Mountain Spotted Fever)" },

    { "id": "695", "name": "Primary Central Nervous System Lymphoma" },

    { "id": "696", "name": "Vasa Previa" },

    { "id": "697", "name": "Infection-Related Glomerulonephritis" },

    { "id": "698", "name": "Global Aphasia" },

    { "id": "699", "name": "MUTYH-associated polyposis" },

    { "id": "700", "name": "Hepatic adenoma" },

    { "id": "701", "name": "Hemoglobin C (HbC) Disease" },

    { "id": "702", "name": "Right Ventricular Hypertrophy (RVH)" },

    { "id": "703", "name": "Prothrombin G20210A Mutation" },

    { "id": "704", "name": "Gilbert syndrome" },

    { "id": "705", "name": "Hypertensive Crisis" },

    { "id": "706", "name": "Tropical sprue" },

    { "id": "707", "name": "Vulnerable Child Syndrome" },

    { "id": "708", "name": "Gonorrhea Prostatitis" },

    { "id": "709", "name": "Atrial Flutter" },

    { "id": "710", "name": "Otitis Media" },

    { "id": "711", "name": "Ebola Virus Disease" },

    { "id": "712", "name": "Spontaneous bacterial peritonitis" },

    { "id": "713", "name": "Albinism" },

    { "id": "714", "name": "Adjustment Disorder" },

    { "id": "715", "name": "Heat Stroke" },

    { "id": "716", "name": "Amphetamine Withdrawal" },

    { "id": "717", "name": "Cor Pulmonale" },

    { "id": "718", "name": "Giant Cell (Temporal) Arteritis" },

    { "id": "719", "name": "Primary Raynaud’s disease" },

    { "id": "720", "name": "Tricuspid Atresia" },

    { "id": "721", "name": "MEN1" },

    { "id": "722", "name": "Ischemic Stroke - Basilar Artery" },

    { "id": "723", "name": "Secondary hyperparathyroidism" },

    { "id": "724", "name": "Legg-Calvé-Perthes Disease" },

    { "id": "725", "name": "Bipolar I Disorder" },

    { "id": "726", "name": "Gardner syndrome" },

    { "id": "727", "name": "Lactational Mastitis" },

    { "id": "728", "name": "Mitral Valve Stenosis" },

    { "id": "729", "name": "Pseudopseudohypoparathyroidism" },

    { "id": "730", "name": "Extragonadal Germ Cell Tumor" },

    { "id": "731", "name": "Penile Squamous Cell Carcinoma" },

    { "id": "732", "name": "Presbyopia" },

    { "id": "733", "name": "Gynecomastia" },

    { "id": "734", "name": "Pyruvate Kinase Deficiency" },

    { "id": "735", "name": "Chiari I Malformation" },

    { "id": "736", "name": "Nephroblastoma (Wilms tumor)" },

    { "id": "737", "name": "Nocardiosis (Nocardia)" },

    { "id": "738", "name": "Schistosoma spp. (Schistosomiasis)" },

    { "id": "739", "name": "Hypoparathyroidism" },

    { "id": "740", "name": "Mitral Valve Regurgitation" },

    { "id": "741", "name": "Sydenham chorea" },

    { "id": "742", "name": "Diastolic Dysfunction" },

    { "id": "743", "name": "Distal Renal Tubular Acidosis (RTA Type 1)" },

    { "id": "744", "name": "Chlamydophila psittaci (Psittacosis)" },

    { "id": "745", "name": "Cardiogenic Shock" },

    { "id": "746", "name": "Syndrome of Apparent Mineralocorticoid Excess (SAME)" },

    { "id": "747", "name": "Porcelain gallbladder" },

    { "id": "748", "name": "Severe Acute Respiratory Syndrome Coronavirus 2 (SARS-CoV-2)" },

    { "id": "749", "name": "Sleep Terror Disorder" },

    { "id": "750", "name": "Lens Dislocation" },

    { "id": "751", "name": "Pheochromocytoma" },

    { "id": "752", "name": "Myositis Ossificans" },

    { "id": "753", "name": "Beckwith-Wiedemann Syndrome" },

    { "id": "754", "name": "Adenocarcinoma of the Lung" },

    { "id": "755", "name": "Popliteal Cyst (Baker's Cyst)" },

    { "id": "756", "name": "Wuchereria bancrofti, Brugia malayi (Lymphatic Filariasis)" },

    { "id": "757", "name": "Sertoli-Leydig Cell Tumor" },

    { "id": "758", "name": "Opioid Intoxication" },

    { "id": "759", "name": "Rh Hemolytic Disease of the Newborn" },

    { "id": "760", "name": "Wilson disease" },

    { "id": "761", "name": "Gambling Disorder" },

    { "id": "762", "name": "Warthin tumor" },

    { "id": "763", "name": "Androgen Insensitivity Syndrome" },

    { "id": "764", "name": "Bordetella pertussis" },

    { "id": "765", "name": "Myelofibrosis" },

    { "id": "766", "name": "Physical Abuse" },

    { "id": "767", "name": "Echovirus" },

    { "id": "768", "name": "Giardia lamblia" },

    { "id": "769", "name": "Sheehan syndrome" },

    { "id": "770", "name": "Uterine Rupture" },

    { "id": "771", "name": "Cyclothymic Disorder" },

    { "id": "772", "name": "Cardiac Arrest" },

    { "id": "773", "name": "Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma" },

    { "id": "774", "name": "Denys-Drash Syndrome" },

    { "id": "775", "name": "Friedreich Ataxia" },

    { "id": "776", "name": "Craniopharyngioma" },

    { "id": "777", "name": "Acute Inflammatory Demyelinating Polyneuropathy / Guillain-Barre Syndrome" },

    { "id": "778", "name": "Alzheimer Disease" },

    { "id": "779", "name": "Primary hyperparathyroidism" },

    { "id": "780", "name": "Mullerian Agenesis" },

    { "id": "781", "name": "Streptococcus agalactiae Meningitis / Group B Streptococcus (GBS) Meningitis" },

    { "id": "782", "name": "Obstructive Sleep Apnea (OSA)" },

    { "id": "783", "name": "Antithrombin Deficiency" },

    { "id": "784", "name": "Megaloblastic Anemia (Folate Deficiency)" },

    { "id": "785", "name": "Separation Anxiety Disorder" },

    { "id": "786", "name": "Obsessive-Compulsive Disorder (OCD)" },

    { "id": "787", "name": "Parkinson Disease" },

    { "id": "788", "name": "Mature Cystic Teratoma" },

    { "id": "789", "name": "Superior Vena Cava (SVC) Syndrome" },

    { "id": "790", "name": "Cholangiocarcinoma" },

    { "id": "791", "name": "Aortic Valve Stenosis" },

    { "id": "792", "name": "Allergic Contact Dermatitis" },

    { "id": "793", "name": "Iron Poisoning" },

    { "id": "794", "name": "Phencyclidine (PCP) Intoxication" },

    { "id": "795", "name": "Lynch syndrome (HNPCC)" },

    { "id": "796", "name": "Pemphigus Vulgaris" },

    { "id": "797", "name": "Greenstick Fracture" },

    { "id": "798", "name": "Autosomal Recessive Polycystic Kidney Disease (ARPKD)" },

    { "id": "799", "name": "Central Transtentorial Herniation / Downward Transtentorial Herniation" },

    { "id": "800", "name": "Imperforate Hymen" },

    { "id": "801", "name": "Paranoid Personality Disorder" },

    { "id": "802", "name": "Choriocarcinoma" },

    { "id": "803", "name": "Alopecia areata" },

    { "id": "804", "name": "Generalized Anxiety Disorder" },

    { "id": "805", "name": "Huntington Disease" },

    { "id": "806", "name": "Vitamin K Deficiency" },

    { "id": "807", "name": "Gastroesophageal reflux disease (GERD)" },

    { "id": "808", "name": "Borrelia burgdorferi (Lyme Disease)" },

    { "id": "809", "name": "Post-MI Ventricular Free Wall Rupture" },

    { "id": "810", "name": "Ovarian Theca Lutein Cyst" },

    { "id": "811", "name": "Coronary Artery Spasm (Prinzmetal's Angina)" },

    { "id": "812", "name": "Wolff-Parkinson-White (WPW) Syndrome" },

    { "id": "813", "name": "Gardnerella vaginalis bacterial vaginosis" },

    { "id": "814", "name": "Holoprosencephaly" },

    { "id": "815", "name": "Varicocele" },

    { "id": "816", "name": "Respiratory Syncytial Virus (RSV) bronchiolitis" },

    { "id": "817", "name": "Aplastic Anemia" },

    { "id": "818", "name": "Type 2 Diabetes Mellitus" },

    { "id": "819", "name": "Arachnoiditis" },

    { "id": "820", "name": "Schizoaffective Disorder" },

    { "id": "821", "name": "Limb Compartment Syndrome" },

    { "id": "822", "name": "Sturge-Weber Syndrome" },

    { "id": "823", "name": "Essential Tremor" },

    { "id": "824", "name": "Bacillary Angiomatosis" },

    { "id": "825", "name": "Ornithine transcarbamylase (OTC) deficiency" },

    { "id": "826", "name": "Escherichia coli (E. coli) Urinary Tract Infection (UTI)" },

    { "id": "827", "name": "Horseshoe Kidney" },

    { "id": "828", "name": "Esophageal varices" },

    { "id": "829", "name": "Rotavirus gastroenteritis" },

    { "id": "830", "name": "Dissociative Identity Disorder" },

    { "id": "831", "name": "Heparin Induced Thrombocytopenia" },

    { "id": "832", "name": "Constrictive Pericarditis" },

    { "id": "833", "name": "Familial Hypertriglyceridemia (Type 4 dyslipidemia)" },

    { "id": "834", "name": "Leprosy (Mycobacterium leprae)" },

    { "id": "835", "name": "Caffeine Intoxication" },

    { "id": "836", "name": "Reactive Arthritis" },

    { "id": "837", "name": "Lichen Sclerosus" },

    { "id": "838", "name": "Acute Interstitial Nephritis (AIN)" },

    { "id": "839", "name": "Osgood-Schlatter Disease" },

    { "id": "840", "name": "Trichinosis (Trichinella spiralis)" },

    { "id": "841", "name": "Systemic Juvenile Idiopathic Arthritis (sJIA)" },

    { "id": "842", "name": "Kawasaki Disease" },

    { "id": "843", "name": "Osteomalacia/Rickets" },

    { "id": "844", "name": "Retrograde Amnesia" },

    { "id": "845", "name": "Hemolytic Anemia due to Infection" },

    { "id": "846", "name": "Major Depressive Disorder with Peripartum Onset" },

    { "id": "847", "name": "Kuru" },

    { "id": "848", "name": "Crohn disease" },

    { "id": "849", "name": "Appendicitis" },

    { "id": "850", "name": "MDMA (Ecstasy) Intoxication" },

    { "id": "851", "name": "Atrial Fibrillation" },

    { "id": "852", "name": "Brown-Séquard Syndrome" },

    { "id": "853", "name": "Endometriosis" },

    { "id": "854", "name": "Ependymoma" },

    { "id": "855", "name": "Gitelman Syndrome" },

    { "id": "856", "name": "Epstein-Barr Virus (EBV) Mononucleosis" },

    { "id": "857", "name": "Fibrinous Pericarditis" },

    { "id": "858", "name": "Thrombotic Thrombocytopenic Purpura" },

    { "id": "859", "name": "Peutz-Jeghers syndrome" },

    { "id": "860", "name": "von Hippel-Lindau Disease" },

    { "id": "861", "name": "Thyroid storm (thyrotoxic crisis)" },

    { "id": "862", "name": "Microscopic Polyangiitis (MPA)" },

    { "id": "863", "name": "Retinal Vein Occlusion" },

    { "id": "864", "name": "Presbycusis" },

    { "id": "865", "name": "Erythema Multiforme" },

    { "id": "866", "name": "Pneumomediastinum" },

    { "id": "867", "name": "Babesiosis" },

    { "id": "868", "name": "IgA Nephropathy (Berger Disease)" },

    { "id": "869", "name": "Aortic Dissection" },

    { "id": "870", "name": "Caplan syndrome" },

    { "id": "871", "name": "Peripartum Blues" },

    { "id": "872", "name": "Pancoast Tumor" },

    { "id": "873", "name": "Plasmodium falciparum Malaria" },

    { "id": "874", "name": "Internal Hemorrhoid" },

    { "id": "875", "name": "Intraductal Papilloma" },

    { "id": "876", "name": "Rickettsia typhi (Endemic Typhus)" },

    { "id": "877", "name": "Lung Abscess" },

    { "id": "878", "name": "Tubo-Ovarian Abscess" },

    { "id": "879", "name": "Rhabdomyomas (Cardiac Tumor)" },

    { "id": "880", "name": "Subclavian Steal Syndrome" },

    { "id": "881", "name": "Langerhans Cell Histiocytosis" },

    { "id": "882", "name": "Aspiration Pneumonia" },

    { "id": "883", "name": "Relative Afferent Pupillary Defect / Marcus Gunn Pupil" },

    { "id": "884", "name": "Kallmann Syndrome" },

    { "id": "885", "name": "Disseminated Neisseria gonorrhoeae" },

    { "id": "886", "name": "Granulomatosis with Polyangiitis (GPA)" },

    { "id": "887", "name": "Adenomatous polyps" },

    { "id": "888", "name": "Birt–Hogg–Dubé (BHD)" },

    { "id": "889", "name": "Achalasia" },

    { "id": "890", "name": "Pleural Effusion" },

    { "id": "891", "name": "Endometritis" },

    { "id": "892", "name": "Mallory-Weiss syndrome" },

    { "id": "893", "name": "Meckel diverticulum" },

    { "id": "894", "name": "Acute Myelogenous Leukemia" },

    { "id": "895", "name": "Malignant Hyperthermia" },

    { "id": "896", "name": "Ramsay Hunt Syndrome (RHS)" },

    { "id": "897", "name": "Submucosal polyps" },

    { "id": "898", "name": "Subdural Hematoma" },

    { "id": "899", "name": "Acne Vulgaris" },

    { "id": "900", "name": "Cimex lectularius and Climex hemipterus (Bed Bugs)" },

    { "id": "901", "name": "Pyloric stenosis" },

    { "id": "902", "name": "Wide Splitting of S2" },

    { "id": "903", "name": "Influenza Virus" },

    { "id": "904", "name": "Tonic-clonic Seizure" },

    { "id": "905", "name": "Microangiopathic Hemolytic Anemia" },

    { "id": "906", "name": "Agoraphobia" },

    { "id": "907", "name": "Primary biliary cholangitis" },

    { "id": "908", "name": "Manic Episode" },

    { "id": "909", "name": "Meningioma" },

    { "id": "910", "name": "Tourette Syndrome" },

    { "id": "911", "name": "Acute gastrointestinal bleeding" },

    { "id": "912", "name": "Anovulatory Infertility" },

    { "id": "913", "name": "Cervical Carcinoma in situ" },

    { "id": "914", "name": "Uncal Transtentorial Herniation" },

    { "id": "915", "name": "HELLP Syndrome" },

    { "id": "916", "name": "Rickettsia prowazekii (Epidemic Typhus)" },

    { "id": "917", "name": "Patent Foramen Ovale (PFO)" },

    { "id": "918", "name": "Osteoporosis" },

    { "id": "919", "name": "Seminoma" },

    { "id": "920", "name": "Hodgkin Lymphoma" },

    { "id": "921", "name": "Conduct Disorder" },

    { "id": "922", "name": "Tinea Pedis (Athlete's Foot)" },

    { "id": "923", "name": "Enterobius vermicularis (Pinworm) infection" },

    { "id": "924", "name": "Placenta Previa" },

    { "id": "925", "name": "Oppositional Defiant Disorder" },

    { "id": "926", "name": "Torsades de Pointes" },

    { "id": "927", "name": "ACL (Anterior Cruciate Ligament) Tear" },

    { "id": "928", "name": "Ischemic Stroke - Posterior Inferior Cerebellar Artery (PICA)" },

    { "id": "929", "name": "Testicular Leydig Cell Tumor" },

    { "id": "930", "name": "Restless Legs Syndrome" },

    { "id": "931", "name": "Enuresis" },

    { "id": "932", "name": "Pelvic Inflammatory Disease" },

    { "id": "933", "name": "Small intestinal bacterial overgrowth (SIBO)" },

    { "id": "934", "name": "Ductal Carcinoma In Situ (DCIS)" },

    { "id": "935", "name": "Congenital hypothyroidism / cretinism" },

    { "id": "936", "name": "Miller Fisher Syndrome (MFS)" },

    { "id": "937", "name": "Mantle Cell Lymphoma" },

    { "id": "938", "name": "Pica" },

    { "id": "939", "name": "Transverse Myelitis" },

    { "id": "940", "name": "Glucagonoma" },

    { "id": "941", "name": "Antisocial Personality Disorder" },

    { "id": "942", "name": "Lambert-Eaton Myasthenic Syndrome" },

    { "id": "943", "name": "Central Vertigo" },

    { "id": "944", "name": "Urgency Incontinence" },

    { "id": "945", "name": "Urticaria (Hives)" },

    { "id": "946", "name": "Histrionic Personality Disorder" },

    { "id": "947", "name": "Preeclampsia" },

    { "id": "948", "name": "Brucellosis (Brucella abortis)" },

    { "id": "949", "name": "Serrated polyps" },

    { "id": "950", "name": "Acute gastritis" },

    { "id": "951", "name": "Riedel thyroiditis" },

    { "id": "952", "name": "SIADH" },

    { "id": "953", "name": "Hyperplastic polyps" },

    { "id": "954", "name": "Dysgerminoma" },

    { "id": "955", "name": "Von Willebrand Disease" },

    { "id": "956", "name": "Somatic Symptom Disorder" },

    { "id": "957", "name": "Histoplasmosis" },

    { "id": "958", "name": "Rhabdomyolysis" },

    { "id": "959", "name": "Contrast-induced thyroiditis / Jod-Basedow phenomenon" },

    { "id": "960", "name": "Open-angle Glaucoma" },

    { "id": "961", "name": "Diverticulosis" },

    { "id": "962", "name": "Cocaine Withdrawal" },

    { "id": "963", "name": "Zika Virus" },

    { "id": "964", "name": "Myelomeningocele" },

    { "id": "965", "name": "Bacillus anthracis" },

    { "id": "966", "name": "Hepatitis E Virus (HEV)" },

    { "id": "967", "name": "Vaginal Clear Cell Carcinoma" },

    { "id": "968", "name": "Cholera (Vibrio cholerae)" },

    { "id": "969", "name": "Atheroembolic Disease / Cholesterol embolization syndrome" },

    { "id": "970", "name": "Glioblastoma multiforme" },

    { "id": "971", "name": "Sporothrix schenckii (Sporotrichosis)" },

    { "id": "972", "name": "Dupuytren Contracture" },

    { "id": "973", "name": "Familial hypocalciuric hypercalcemia" },

    { "id": "974", "name": "Disruptive Mood Dysregulation Disorder" },

    { "id": "975", "name": "Plasmodium vivax/ovale Malaria" },

    { "id": "976", "name": "Diphyllobothrium latum (Fish Tapeworm)" },

    { "id": "977", "name": "Peritonsillar Abscess" },

    { "id": "978", "name": "Carpal Tunnel Syndrome" },

    { "id": "979", "name": "Horner Syndrome" },

    { "id": "980", "name": "Hyperkalemic Tubular Acidosis (RTA Type 4)" },

    { "id": "981", "name": "Vascular Dementia" },

    { "id": "982", "name": "Dermatitis Herpetiformis" },

    { "id": "983", "name": "Shigellosis (Shigella)" },

    { "id": "984", "name": "Struma ovarii hyperthyroidism" },

    { "id": "985", "name": "Cardiac Myxoma" },

    { "id": "986", "name": "Multicystic dysplastic kidney" },

    { "id": "987", "name": "Hypogonadotropic Hypogonadism" },

    { "id": "988", "name": "Primary Ovarian Insufficiency" },

    { "id": "989", "name": "Osteochondroma" },

    { "id": "990", "name": "Spermatocele" },

    { "id": "991", "name": "Interstitial (Atypical) Pneumonia" },

    { "id": "992", "name": "Waardenburg Syndrome" },

    { "id": "993", "name": "Orolabial Herpes Simplex Virus Infection (HSV-1)" },

    { "id": "994", "name": "Tension Pneumothorax" },

    { "id": "995", "name": "Primary Spontaneous Pneumothorax" },

    { "id": "996", "name": "Vaginal Squamous Cell Carcinoma" },

    { "id": "997", "name": "Polycythemia Vera" },

    { "id": "998", "name": "Herpes Simplex Virus (HSV-1) Meningitis" },

    { "id": "999", "name": "Hypovolemic Shock" },

    { "id": "1000", "name": "Actinomycosis" },

    { "id": "1001", "name": "Obstructive Shock" },

    { "id": "1002", "name": "Hyperosmolar hyperglycemic state (HHS)" },

    { "id": "1003", "name": "Bacterial parotitis" },

    { "id": "1004", "name": "Iodine-deficiency hypothyroidism" },

    { "id": "1005", "name": "Subacute Combined Degeneration" },

    { "id": "1006", "name": "Narcolepsy" },

    { "id": "1007", "name": "Retropharyngeal Abscess" },

    { "id": "1008", "name": "Pityriasis Rosea" },

    { "id": "1009", "name": "Focal Impaired Awareness Seizure" },

    { "id": "1010", "name": "Hypomanic Episode" },

    { "id": "1011", "name": "CN VI Damage" },

    { "id": "1012", "name": "Leiomyoma (Fibroid)" },

    { "id": "1013", "name": "Berylliosis" },

    { "id": "1014", "name": "Iliotibial Band Syndrome" },

    { "id": "1015", "name": "Bipolar II Disorder" },

    { "id": "1016", "name": "Thyroid undifferentiated/anaplastic carcinoma" },

    { "id": "1017", "name": "Carbon Monoxide Poisoning" },

    { "id": "1018", "name": "Fibromuscular Dysplasia" },

    { "id": "1019", "name": "Ludwig Angina" },

    { "id": "1020", "name": "Transient Ischemic Attack (TIA)" },

    { "id": "1021", "name": "Bunyaviruses (e.g., Hantavirus)" },

    { "id": "1022", "name": "Left Ventricular Hypertrophy (LVH)" },

    { "id": "1023", "name": "Protein C/S Deficiency" },

    { "id": "1024", "name": "Pseudohypoparathyroidism type 1A" },

    { "id": "1025", "name": "Hypertensive Heart Disease" },

    { "id": "1026", "name": "Tinea Unguium (Onychomycosis)" },

    { "id": "1027", "name": "Avascular Necrosis of Bone" },

    { "id": "1028", "name": "IgG4-Related Disease" },

    { "id": "1029", "name": "Conus Medullaris Syndrome" },

    { "id": "1030", "name": "Coxsackievirus (Hand, Foot, and Mouth Disease)" },

    { "id": "1031", "name": "Osteopetrosis" },

    { "id": "1032", "name": "2nd Degree AV Block Type I (Mobitz I)" },

    { "id": "1033", "name": "Spondylolisthesis" },

    { "id": "1034", "name": "External Hemorrhoid" },

    { "id": "1035", "name": "Adenovirus Infection" },

    { "id": "1036", "name": "Wernicke's (Receptive) Aphasia" },

    { "id": "1037", "name": "Cannabis Withdrawal" },

    { "id": "1038", "name": "Communicating Hydrocephalus" },

    { "id": "1039", "name": "Aortic Aneurysm" },

    { "id": "1040", "name": "Left Bundle Branch Block (LBBB)" },

    { "id": "1041", "name": "Diffuse Proliferative Glomerulonephritis" },

    { "id": "1042", "name": "Silicosis" },

    { "id": "1043", "name": "Pulmonary Hypertension" },

    { "id": "1044", "name": "Ichthyosis Vulgaris" },

    { "id": "1045", "name": "Acute Disseminated (Postinfectious) Encephalomyelitis" },

    { "id": "1046", "name": "Rotator Cuff Tendinopathy / Tendinitis / Tendinosis" },

    { "id": "1047", "name": "Arteriovenous Fistula" },

    { "id": "1048", "name": "Polyarteritis Nodosa (PAN)" },

    { "id": "1049", "name": "Pressure Injury (Decubitus Ulcer)" },

    { "id": "1050", "name": "Renal Osteodystrophy" },

    { "id": "1051", "name": "Lichen Simplex Chronicus" },

    { "id": "1052", "name": "Cerebral Edema" },

    { "id": "1053", "name": "Bell Palsy" },

    { "id": "1054", "name": "Multifocal Atrial Tachycardia (MAT)" },

    { "id": "1055", "name": "Patent Ductus Arteriosus (PDA)" },

    { "id": "1056", "name": "Chiari II Malformation" },

    { "id": "1057", "name": "Cannabis Intoxication" },

    { "id": "1058", "name": "Dubin-Johnson syndrome" },

    { "id": "1059", "name": "Alcohol Intoxication" },

    { "id": "1060", "name": "Ehrlichia chaffeensis (Ehrlichiosis)" },

    { "id": "1061", "name": "Cryptorchidism" },

    { "id": "1062", "name": "Amphetamine Intoxication" },

    { "id": "1063", "name": "Stress Incontinence" },

    { "id": "1064", "name": "Major Depressive Disorder with Seasonal Pattern (Seasonal Affective Disorder)" },

    { "id": "1065", "name": "Cauda Equina Syndrome" },

    { "id": "1066", "name": "Salivary gland tumors" },

    { "id": "1067", "name": "Cervical Spondylosis" },

    { "id": "1068", "name": "Menetrier Disease" },

    { "id": "1069", "name": "Functional Hypothalamic Amenorrhea" },

    { "id": "1070", "name": "Warm Autoimmune Hemolytic Anemia" },

    { "id": "1071", "name": "Macroangiopathic Hemolytic Anemia" },

    { "id": "1072", "name": "Systemic Lupus Erythematosus (SLE)" },

    { "id": "1073", "name": "Lichen Planus" },

    { "id": "1074", "name": "Hyperlipidemia" },

    { "id": "1075", "name": "Neurofibromatosis Type II" },

    { "id": "1076", "name": "Klebsiella pneumoniae" },

    { "id": "1077", "name": "Short bowel syndrome" },

    { "id": "1078", "name": "Glycogen storage disease IV (Andersen Disease)" },

    { "id": "1079", "name": "Diabetic Glomerulonephropathy" },

    { "id": "1080", "name": "Plasmodium malariae Malaria" },

    { "id": "1081", "name": "Foreign body conjunctivitis" },

    { "id": "1082", "name": "Fibroadenoma" },

    { "id": "1083", "name": "VIPoma" },

    { "id": "1084", "name": "Congenital Adrenal Hyperplasia (17-Alpha-Hydroxylase Deficiency)" },

    { "id": "1085", "name": "Lipoma" },

    { "id": "1086", "name": "Morton's Neuroma" },

    { "id": "1087", "name": "Scombroid Poisoning" },

    { "id": "1088", "name": "Sliding Hiatal Hernia" },

    { "id": "1089", "name": "Paraesophageal Hiatal Hernia" },

    { "id": "1090", "name": "Cholestasis of pregnancy" },

    { "id": "1091", "name": "Ischemic Colitis" },

    { "id": "1092", "name": "Cecal Volvulus" },

    { "id": "1093", "name": "Pyogenic Liver Abscess" },

    { "id": "1094", "name": "Foreign body aspiration" },

    { "id": "1095", "name": "Myocardial Contusion" },

    { "id": "1096", "name": "Pulmonary Contusion" },

    { "id": "1097", "name": "Annular Pancreas" },

    { "id": "1098", "name": "Pancreas Divisum" },

    { "id": "1099", "name": "Indirect Inguinal Hernia" },

    { "id": "1100", "name": "Direct Inguinal Hernia" },

    { "id": "1101", "name": "Femoral Hernia" },

    { "id": "1102", "name": "Aspirin-Exacerbated Respiratory Disease (AERD)" },

    { "id": "1103", "name": "Allergic Bronchopulmonary Aspergillosis (ABPA)" },

    { "id": "1104", "name": "Incisional Hernia" },

    { "id": "1105", "name": "Diastasis Recti" },

    { "id": "1106", "name": "Fibrocystic Changes of the Breast" },

    { "id": "1107", "name": "Double Outflow Right Ventricle (DORV)" },

    { "id": "1108", "name": "Neonatal gonococcal conjunctivitis" },

    { "id": "1109", "name": "Chlamydia conjunctivitis in newborns" },

    { "id": "1110", "name": "Wiskott-Aldrich syndrome (WAS)" },

    { "id": "1111", "name": "Job syndrome (Hyper-IgE syndrome)" },

    { "id": "1112", "name": "Severe combined immunodeficiency (SCID)" },

    { "id": "1113", "name": "DiGeorge Syndrome" },

    { "id": "1114", "name": "Chronic granulomatous disease (CGD)" },

    { "id": "1115", "name": "Leukocyte adhesion deficiency (LAD)" },

    { "id": "1116", "name": "X-linked (Bruton) agammaglobulinemia" },

    { "id": "1117", "name": "Ataxia telangiectasia" },

    { "id": "1118", "name": "Xeroderma Pigmentosum" },

    { "id": "1119", "name": "Lesch-Nyhan Syndrome" },

    { "id": "1120", "name": "Duchenne Muscular Dystrophy" },

    { "id": "1121", "name": "Becker Muscular Dystrophy" },

    { "id": "1122", "name": "Osteogenesis Imperfecta" },

    { "id": "1123", "name": "Edward Syndrome" },

    { "id": "1124", "name": "Patau Syndrome" },

    { "id": "1125", "name": "Prader-Willi Syndrome" },

    { "id": "1126", "name": "Angelman Syndrome" },

    { "id": "1127", "name": "Cri-du-chat Syndrome" },

    { "id": "1128", "name": "Cat eye syndrome (Schmid-Fraccaro syndrome)" },

    { "id": "1129", "name": "Glycogen storage disease I (Van Gierke Disease)" },

    { "id": "1130", "name": "Hurler Syndrome / Mucopolysaccharidosis Type I" },

    { "id": "1131", "name": "Tay-Sachs Disease" },

    { "id": "1132", "name": "Sandhoff disease" },

    { "id": "1133", "name": "Gaucher Disease" },

    { "id": "1134", "name": "Krabbe Disease" },

    { "id": "1135", "name": "Metachromatic leukodystrophy (MLD)" },

    { "id": "1136", "name": "Niemann-Pick disease" },

    { "id": "1137", "name": "Fabry Disease" },

    { "id": "1138", "name": "Maple Syrup Urine Disease (MSUD)" },

    { "id": "1139", "name": "Phenylketonuria (PKU)" },

    { "id": "1140", "name": "Argininosuccinic Aciduria (ASL)" },

    { "id": "1141", "name": "Cystinuria" },

    { "id": "1142", "name": "Homocystinuria" },

    { "id": "1143", "name": "GM1 gangliosidosis" },

    { "id": "1144", "name": "Glycogen storage disease V (McArdle Disease)" },

    { "id": "1145", "name": "Galactosemia" },

    { "id": "1146", "name": "Tyrosinemia" },

    { "id": "1147", "name": "Hereditary Fructose Intolerance (HFI)" },

    { "id": "1148", "name": "McCune-Albright Syndrome" },

    { "id": "1149", "name": "Zellweger Syndrome" },

    { "id": "1150", "name": "X-Linked Adrenoleukodystrophy" },

    { "id": "1151", "name": "MCAD deficiency (Medium-chain acyl-CoA dehydrogenase deficiency)" },

    { "id": "1152", "name": "Selective IgA Deficiency" },

    { "id": "1153", "name": "CD40 Ligand Deficiency (Hyper-IgM syndrome)" },

    { "id": "1154", "name": "Chronic Mucocutaneous Candidiasis" },

    { "id": "1155", "name": "Fetal hydantoin syndrome (FHS)" },

    { "id": "1156", "name": "Sinding-Larsen-Johansson (SLJ) syndrome" },

    { "id": "1157", "name": "Felty Syndrome" },

    { "id": "1158", "name": "Paget-Schroetter Syndrome (PSS)" },

    { "id": "1159", "name": "Foster Kennedy Syndrome (FKS)" },

    { "id": "1160", "name": "Williams syndrome" },

    { "id": "1161", "name": "Cornelia de Lange Syndrome (CdLS)" },

    { "id": "1162", "name": "Smith-Magenis Syndrome (SMS)" },

    { "id": "1163", "name": "Brief psychotic disorder" },

    { "id": "1164", "name": "Enhanced physiologic tremor" },

    { "id": "1165", "name": "Transient synovitis" },

    { "id": "1166", "name": "Premature Ejaculation" },

    { "id": "1167", "name": "Kluver-Bucy Syndrome" },

    { "id": "1168", "name": "Streptococcus pneumoniae Meningitis / Pneumococcal Meningitis" },

    { "id": "1169", "name": "Genito-Pelvic Pain/Penetration Disorder (GPPPD)" },

    { "id": "1170", "name": "Sexual aversion" },

    { "id": "1171", "name": "Antidepressant discontinuation syndrome" },

    { "id": "1172", "name": "Avoidant/Restrictive Food Intake Disorder (ARFID)" },

    { "id": "1173", "name": "Postural Orthostatic Tachycardia Syndrome (POTS)" },

    { "id": "1174", "name": "PANS (Pediatric Acute-onset Neuropsychiatric Syndrome)" },

    { "id": "1175", "name": "Duodenal Atresia" },

    { "id": "1176", "name": "Intestinal Atresia" },

    { "id": "1177", "name": "Leriche syndrome (aortoiliac occlusive disease)" },

    { "id": "1178", "name": "Lemierre's Syndrome" },

    { "id": "1179", "name": "Rett Syndrome" },

    { "id": "1180", "name": "Bronchiolitis obliterans (popcorn lung)" },

    { "id": "1181", "name": "Septic pelvic thrombophlebitis" },

    { "id": "1182", "name": "Threatened Abortion" },

    { "id": "1183", "name": "Missed Abortion" },

    { "id": "1184", "name": "Inevitable Abortion" },

    { "id": "1185", "name": "Complete Abortion" },

    { "id": "1186", "name": "Incomplete Abortion" },

    { "id": "1187", "name": "Uterine Prolapse" },

    { "id": "1188", "name": "Procidentia" },

    { "id": "1189", "name": "Uterine Inversion" },

    { "id": "1190", "name": "Cystocele" },

    { "id": "1191", "name": "Rectocele" },

    { "id": "1192", "name": "Enterocele" },

    { "id": "1193", "name": "Placenta Increta" },

    { "id": "1194", "name": "Placenta Percreta" },

    { "id": "1195", "name": "Vesicovaginal fistula" },

    { "id": "1196", "name": "Aortoenteric fistula" },

    { "id": "1197", "name": "Tracheobronchial rupture" },

    { "id": "1198", "name": "Enterocutaneous fistula" },

    { "id": "1199", "name": "Perianal abscess" },

    { "id": "1200", "name": "Anorectal fistula" },

    { "id": "1201", "name": "Pilonidal cyst" },

    { "id": "1202", "name": "Pancreaticopleural fistula" },

    { "id": "1203", "name": "Post-MI Ventricular Pseudoaneurysm" },

    { "id": "1204", "name": "Post-MI True Ventricular Aneurysm" },

    { "id": "1205", "name": "Pancreatic pseudocyst" },

    { "id": "1206", "name": "Acute Necrotizing Pancreatitis" },

    { "id": "1207", "name": "Pseudoaneurysm" },

    { "id": "1208", "name": "Thoracic Outlet Syndrome (TOS)" },

    { "id": "1209", "name": "Klumpke Palsy" },

    { "id": "1210", "name": "Erb's palsy" },

    { "id": "1211", "name": "Rectovaginal fistula" },

    { "id": "1212", "name": "Psychogenic dyspareunia" },

    { "id": "1213", "name": "Pelvic adhesive disease" },

    { "id": "1214", "name": "Diffuse Large B Cell Lymphoma" },

    { "id": "1215", "name": "Piriformis syndrome" },

    { "id": "1216", "name": "Greater Trochanteric Pain Syndrome (GTPS)" },

    { "id": "1217", "name": "Intertrochanteric fracture" },

    { "id": "1218", "name": "Anterior shoulder dislocation" },

    { "id": "1219", "name": "Anterior hip dislocation" },

    { "id": "1220", "name": "Posterior hip dislocation" },

    { "id": "1221", "name": "Posterior shoulder dislocation" },

    { "id": "1222", "name": "Intraperitoneal bladder rupture" },

    { "id": "1223", "name": "Extraperitoneal bladder rupture" },

    { "id": "1224", "name": "Urethral stricture" },

    { "id": "1225", "name": "Posterior Urethral Injury (Pelvic trauma)" },

    { "id": "1226", "name": "Anterior Urethral Injury (Straddle Injury)" },

    { "id": "1227", "name": "Orbital cellulitis" },

    { "id": "1228", "name": "Preseptal cellulitis" },

    { "id": "1229", "name": "Acute aortic occlusion (AAO)" },

    { "id": "1230", "name": "Retained placenta" },

    { "id": "1231", "name": "Retained products of conception (RPOC)" },

    { "id": "1232", "name": "Familial Combined Hyperlipidemia (Type 2b dyslipidemia)" },

    { "id": "1233", "name": "Familial Dysbetalipoproteinemia (Type 3 dyslipidemia)" },

    { "id": "1234", "name": "Infant botulism" },

    { "id": "1235", "name": "Hypertensive Encephalopathy" },

    { "id": "1236", "name": "Autoimmune (Anti-NMDAR) Encephalitis" },

    { "id": "1237", "name": "Guttate Psoriasis" },

    { "id": "1238", "name": "Inverse Psoriasis" },

    { "id": "1239", "name": "Pustular Psoriasis" },

    { "id": "1240", "name": "Erythrodermic Psoriasis" },

    { "id": "1241", "name": "Methemoglobinemia" },

    { "id": "1242", "name": "Acral Lentiginous Melanoma" },

    { "id": "1243", "name": "Nodular Melanoma" },

    { "id": "1244", "name": "Keratoacanthoma" },

    { "id": "1245", "name": "Bowen's disease" },

    { "id": "1246", "name": "Cathinone intoxication (bath salt intoxication)" },

    { "id": "1247", "name": "Inhalant abuse" },

    { "id": "1248", "name": "Posterior Reversible Encephalopathy Syndrome (PRES) / Reversible Posterior Leukoencephalopathy Syndrome (RPLS)" },

    { "id": "1249", "name": "Epithelioid Sarcoma" },

    { "id": "1250", "name": "Congenital Adrenal Hyperplasia (11-Beta-Hydroxylase Deficiency)" },

    { "id": "1251", "name": "Nonclassic Congenital Adrenal Hyperplasia (partial 21-Hydroxylase Deficiency)" },

    { "id": "1252", "name": "Olecranon Bursitis" },

    { "id": "1253", "name": "Subacromial Bursitis" },

    { "id": "1254", "name": "Ischial Bursitis" },

    { "id": "1255", "name": "Acromioclavicular joint sprain" },

    { "id": "1256", "name": "Medial Meniscus Tear" },

    { "id": "1257", "name": "Lateral Meniscus Tear" },

    { "id": "1258", "name": "Bacterial Tracheitis" },

    { "id": "1259", "name": "Laryngitis" },

    { "id": "1260", "name": "Vocal cord paralysis" },

    { "id": "1261", "name": "Chronic Traumatic Encephalopathy (CTE)" },

    { "id": "1262", "name": "Congenital Sucrase-Isomaltase Deficiency" },

    { "id": "1263", "name": "Common Variable Immunodeficiency (CVID)" },

    { "id": "1264", "name": "Epididymal Cyst" },

    { "id": "1265", "name": "Viral conjunctivitis" },

    { "id": "1266", "name": "Pterygium (surfer's eye)" },

    { "id": "1267", "name": "Corneal abrasion" },

    { "id": "1268", "name": "Candida albicans intertrigo" },

    { "id": "1269", "name": "Positional plagiocephaly" },

    { "id": "1270", "name": "Craniosynostosis" },

    { "id": "1271", "name": "Brachycephaly" },

    { "id": "1272", "name": "Phimosis" },

    { "id": "1273", "name": "Balanitis" },

    { "id": "1274", "name": "Hordoleum (stye)" },

    { "id": "1275", "name": "Chalazion" },

    { "id": "1276", "name": "Dacryocystitis" },

    { "id": "1277", "name": "Dacryostenosis" },

    { "id": "1278", "name": "Nasolacrimal duct obstruction (NLDO)" },

    { "id": "1279", "name": "Blepharitis" },

    { "id": "1280", "name": "Hemiballismus" },

    { "id": "1281", "name": "Blepharospasm" },

    { "id": "1282", "name": "Sickle cell trait" },

    { "id": "1283", "name": "Frostbite / Freezing cold injury" },

    { "id": "1284", "name": "Erythromelalgia" },

    { "id": "1285", "name": "Progressive Supranuclear Palsy (PSP)" },

    { "id": "1286", "name": "Multiple System Atrophy (MSA)" },

    { "id": "1287", "name": "DRESS syndrome (Drug Reaction with Eosinophilia and Systemic Symptoms)" },

    { "id": "1288", "name": "Corticobasal Degeneration (CBD)" },

    { "id": "1289", "name": "Lymphogranuloma venereum (LGV)" },

    { "id": "1290", "name": "Concussion" },

    { "id": "1291", "name": "Post-concussion Syndrome" },

    { "id": "1292", "name": "Neonatal Respiratory Distress Syndrome (NRDS)" },

    { "id": "1293", "name": "Laxative Abuse / Melanosis Coli" },

    { "id": "1294", "name": "Polymorphous Light Eruption" },

    { "id": "1295", "name": "Perimenopause" },

    { "id": "1296", "name": "Autoimmune / Secondary Amyloidosis (AA)" },

    { "id": "1297", "name": "Dialysis-Related Amyloidosis" },

    { "id": "1298", "name": "Transthyretin Amyloidosis (ATTR)" },

    { "id": "1299", "name": "Paragonimus westermani (Oriental lung fluke)" },

    { "id": "1300", "name": "Hypermobility Spectrum Disorders (HSD)" },

    { "id": "1301", "name": "Ehlers-Danlos syndromes (EDS)" },

    { "id": "1302", "name": "Mast Cell Activation Syndrome (MCAS)" },

    { "id": "1303", "name": "Marfan Syndrome" },

    { "id": "1304", "name": "Achilles Tendinitis" },

    { "id": "1305", "name": "Fournier gangrene" },

    { "id": "1306", "name": "Tarsal Tunnel Syndrome" },

    { "id": "1307", "name": "Herpetic Whitlow" },

    { "id": "1308", "name": "Calcaneal apophysitis (Sever's disease)" },

    { "id": "1309", "name": "Calcaneal stress fracture" },

    { "id": "1310", "name": "Achilles tendon rupture" },

    { "id": "1311", "name": "Francisella Tularensis (Tularemia)" },

    { "id": "1312", "name": "Prune Belly Syndrome (Eagle-Barrett)" },

    { "id": "1313", "name": "Nutcracker syndrome" },

    { "id": "1314", "name": "Coccydynia" },

    { "id": "1315", "name": "Wet beriberi" },

    { "id": "1316", "name": "Dry beriberi" },

    { "id": "1317", "name": "Non-Typhoidal Salmonellosis / Salmonella Gastroenteritis" },

    { "id": "1318", "name": "Epidermoid Cyst" },

    { "id": "1319", "name": "Oral Candidiasis" },

    { "id": "1320", "name": "Oral Leukoplakia" },

    { "id": "1321", "name": "Herpes Simplex Virus (HSV-1) Encephalitis" },

    { "id": "1322", "name": "Eczema Herpeticum" },

    { "id": "1323", "name": "Non-Staphylococcal Impetigo" },

    { "id": "1324", "name": "Shin Splints" },

    { "id": "1325", "name": "Ménière Disease / Meniere Disease" },

    { "id": "1326", "name": "Vestibular Neuritis" },

    { "id": "1327", "name": "Chronic Inflammatory Demyelinating Polyneuropathy (CIDP)" },

    { "id": "1328", "name": "Normal Intrauterine Pregnancy" },

    { "id": "1329", "name": "Penile Fracture" },

    { "id": "1330", "name": "Decompression Sickness" }

]