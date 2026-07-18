"use client"

import { useState } from "react";
import CaseDesigner from "@/components/simulator/CaseDesigner";
import SimulatorNav from "@/components/simulator/SimulatorNav";

export default function SimulatorPage({ params }: { params: { id: string } }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div>
            <SimulatorNav
                caseId={params.id}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((v) => !v)}
            />
            <CaseDesigner
                caseId={params.id}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
        </div>
    );
}