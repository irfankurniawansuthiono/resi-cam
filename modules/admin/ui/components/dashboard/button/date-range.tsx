import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDateRange } from "@/utils/formatDateRange";
import { id } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

export default function DateRangeSelect({
    setDateRange,
    dateRange,
}: {
    dateRange: DateRange | undefined;
    setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}) {
    const today = new Date();

    const minDate = new Date();
    minDate.setDate(today.getDate() - 45);
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange && formatDateRange(dateRange)}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    required
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={id}
                    disabled={date => date > today || date < minDate}
                />
            </PopoverContent>
        </Popover>
    );
}
