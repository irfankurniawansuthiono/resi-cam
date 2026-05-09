import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
export function formatDateRange(dateRange: DateRange) {
    return dateRange?.from && dateRange?.to
        ? `${format(dateRange.from, "d MMM yyyy", { locale: id })} – ${format(dateRange.to, "d MMM yyyy", { locale: id })}`
        : "Select Date Range";
}
