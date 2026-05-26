"use client";
import PageContainer from "@/components/custom/page-container";
import { useDebounce } from "@/hooks/use-debounce";
import DateRangeSelect from "@/modules/admin/ui/components/dashboard/button/date-range";
import { subDays } from "date-fns";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DashboardComponent } from "./dashboard-component";

export default function DashboardPageComponent() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const debounce = useDebounce(dateRange, 3000);

    return (
        <PageContainer
            pageTitle="Dashboard"
            pageDescription="Summary of recording activity"
            pageHeaderAction={<DateRangeSelect dateRange={dateRange} setDateRange={setDateRange} />}
        >
            <DashboardComponent dateRange={debounce} />
        </PageContainer>
    );
}
