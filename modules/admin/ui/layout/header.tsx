"use client";

import { ThemeModeToggle } from "@/components/custom/theme-mode-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumbs } from "@/modules/admin/ui/components/breadcrumbs";
import { NotificationDropdown } from "@/modules/admin/ui/components/notification-dropdown";
import { SearchInput } from "@/modules/admin/ui/components/search-input";

export default function Header() {
    return (
        <header className="sticky top-4 z-50 mx-4 mt-4 flex h-16 shrink-0 items-center justify-between gap-2 rounded-xl border bg-background/95 px-6 shadow-md backdrop-blur supports-backdrop-filter:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumbs />
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden md:flex">
                    <SearchInput />
                </div>
                <NotificationDropdown />
                <ThemeModeToggle />
            </div>
        </header>
    );
}
