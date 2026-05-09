"use client";
import { useDebounce } from "@/hooks/use-debounce";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DataTableTemplate } from "../table";
import SortByCameras from "./button/sort-by-logs";
import columns from "./columns";
export default function LogsDataTable() {
    const trpc = useTRPC();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    // sort by state
    const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt">("updatedAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading, isError, error } = useQuery(
        trpc.camera.get.queryOptions({
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
                <SortByCameras
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                />
            }
            filterComponents={<></>}
            onPageChange={(page: number) => setPage(page)}
            columns={columns(page, limit)}
            data={data?.cameras || []}
            searchPlaceHolder="Search by message"
            metadata={data?.meta}
            isLoading={isLoading}
            onNextPage={() => setPage(page + 1)}
            onPrevPage={() => setPage(page - 1)}
            onLimitChange={limit => setLimit(limit)}
            onSearchChange={search => setSearch(search)}
        />
    );
}
