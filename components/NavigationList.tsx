import {
    LayoutDashboard,
    BookOpen,
    Beaker,
    ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Classes", href: "/classes", icon: BookOpen },
    { label: "Simulator", href: "/simulator", icon: Beaker },
    { label: "Quizzes", href: "/quiz", icon: ClipboardList },
];

export default function NavigationList({ isAdmin = false }: { isAdmin?: boolean }) {
    const [showMenu, setShowMenu] = useState(false);
    const pathname = usePathname();

    const router = useRouter();
    function isActive(href: string) {
        if (href === "/quiz") return pathname.startsWith("/quiz");
        return pathname.startsWith(href);
    }
    const visibleItems = NAV_ITEMS.filter((item) => {
        if (isAdmin) return true;
        return item.label === "Classes" || item.label === "Simulator";
    });
    return (
        <div className="space-y-0.5">
            {visibleItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                    <div
                        key={item.href}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                            router.push(item.href);
                            setShowMenu(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                router.push(item.href);
                                setShowMenu(false);
                            }
                        }}
                        className={`group relative flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2 text-left transition ${active
                            ? "bg-iris-50 text-iris-700"
                            : "text-ink-700 hover:bg-ink-900/[0.03]"
                            }`}
                    >
                        <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center ${active ? "text-iris-600" : "text-ink-300"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate text-[13.5px] font-medium">
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    )

}