# Clinical Simulation Platform

A medical simulation app for training clinical decision-making. Case authors build interactive management graphs; players navigate scenarios by ordering investigations, selecting medications with correct dosages, and making disposition decisions.

Built with **Next.js 14** (App Router), **Tailwind CSS**, **Firebase Auth + Firestore**, and **Clerk**.

## Features

- **Case Designer** — authors create cases with vitals, history, physical exam, and a directed graph of management nodes
- **Graph Editor** — drag-and-drop graph builder with intervention, required intervention, outcome, diagnosis, and lab result nodes
- **Player** — step through a case: review vitals, order labs/imaging, select interventions with dose options, make diagnosis
- **Dose-aware matching** — medications carry dose selections; wrong doses trigger deterioration outcomes
- **Disposition system** — disposition options unlock after completing required management
- **Google sign-in** via Firebase Auth (with Clerk for session management)
- **Responsive** — left panel (gradient mesh) hides below `lg`, form stays centered

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com), then:
   - Enable **Authentication → Email/Password** and **Google** providers
   - Create a **Cloud Firestore** database
   - Copy your web app config values

3. **Set environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in the `NEXT_PUBLIC_FIREBASE_*` values and any other required keys.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  simulator/          — case designer, graph editor
  simulator/play/     — case player
components/simulator/
  CaseDesigner.tsx    — create/edit case metadata
  GraphEditor.tsx     — authoring graph canvas
  PlayCase.tsx        — player state machine & graph execution
  ManagementPanel.tsx — player intervention/disposition UI
  ImagingPanel.tsx    — player imaging & lab viewer
  database.ts         — medication doses, management library
  types.ts            — shared types
  utils.ts            — helpers
lib/firebase.ts       — Firebase auth + Firestore init
```

## Authoring a case

1. Go to `/simulator` → **New Case**
2. Fill in vitals, history, physical exam
3. Build a management graph:
   - **Intervention nodes** — actions the player can take; attach required dose via `doseMap`
   - **Required nodes** — mandatory interventions; `requiredDoseMap` gates the bonus reward
   - **Outcome nodes** — health changes, vital changes, or `unlockEvent` (unlocks dispositions)
   - **Diagnosis nodes** — set the correct diagnosis; player must match it exactly
   - **Lab result nodes** — display lab data when the player orders a test
4. Publish → share the case ID with players
