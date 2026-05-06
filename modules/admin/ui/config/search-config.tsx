import { LayoutDashboard, Package, Settings } from "lucide-react";

export type SearchItem = {
    title: string;
    url: string;
    group: string;
    icon: React.ComponentType<{ className?: string }>;
    shortcut?: string[];
};

export const searchItems: SearchItem[] = [
    // Pages
    {
        title: "Dashboard",
        url: "/admin/dashboard",
        group: "Pages",
        icon: LayoutDashboard,
        shortcut: ["d", "d"],
    },
    {
        title: "Settings",
        url: "/admin/settings",
        group: "Pages",
        icon: Settings,
        shortcut: ["s", "s"],
    },
    {
        title: "Pack",
        url: "/pack",
        group: "Pages",
        icon: Package,
        shortcut: ["p", "p"],
    },
];
