"use client"

import { useState } from "react";
import CaseDesigner from "@/components/simulator/CaseDesigner";

export default function SimulatorPage({ params }: { params: { id: string } }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <CaseDesigner
            caseId={params.id}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
        />
    );
}
