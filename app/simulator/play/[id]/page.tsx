import PlayCase from "@/components/simulator/PlayCase";

export default function SimulatorPlayPage({ params }: { params: { id: string } }) {
    return <PlayCase caseId={params.id} />;
}
