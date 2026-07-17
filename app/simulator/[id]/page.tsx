import CaseDesigner from "@/components/simulator/CaseDesigner";

export default function SimulatorPage({ params }: { params: { id: string } }) {
    return (
        <div>
            <CaseDesigner caseId={params.id} />
        </div>
    );
}