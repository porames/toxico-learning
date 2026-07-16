// app/classes/[id]/page.tsx
import StudentDashboard from "@/components/classes/StudentDashboard"; // adjust path

export default function ClassPage({ params }: { params: { id: string } }) {
    return (
        <div>
            <StudentDashboard classId={params.id} />
        </div>
    );
}