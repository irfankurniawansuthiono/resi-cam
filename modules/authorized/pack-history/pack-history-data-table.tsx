"use client";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTableTemplate } from "@/modules/admin/ui/components/table";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SortByPacks from "./button/sort-by-pack";
import columns from "./columns";
export default function PackHistoryDataTable() {
    const trpc = useTRPC();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    // sort by state
    const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt">("updatedAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading, isError, error } = useQuery(
        trpc.record.get.queryOptions({
            limit,
            page,
            search: debouncedSearch,
            sortBy,
            sortDirection,
        }),
    );

    return (
        <DataTableTemplate
            isError={isError}
            error={error}
            sortByComponents={
                <SortByPacks
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                />
            }
            filterComponents={<></>}
            onPageChange={(page: number) => setPage(page)}
            columns={columns(page, limit)}
            data={data?.packs || []}
            searchPlaceHolder="Search barcode resi"
            metadata={data?.meta}
            isLoading={isLoading}
            onNextPage={() => setPage(page + 1)}
            onPrevPage={() => setPage(page - 1)}
            onLimitChange={limit => setLimit(limit)}
            onSearchChange={search => setSearch(search)}
        />
    );
}
