

export default function formatTimeRange(start: Date, end: Date) {
    try {
        const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
        return `${fmt.format(start)} – ${fmt.format(end)}`;
    } catch {
        return "Time not set";
    }
}