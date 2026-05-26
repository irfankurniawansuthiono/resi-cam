"use client";
import { DataTableTemplate } from "../table";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import columns from "./columns";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import FilterUsers from "./button/filter-user";
import { roleList } from "../../config/auth/role.user";
import SortByUsers from "./button/sort-by-user";
export default function UsersDataTable() {
  const trpc = useTRPC();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  // filter state
  const [rolesFilter, setRolesFilter] = useState<(typeof roleList)[number][]>([]);
  const [bannedFilter, setBannedFilter] = useState<boolean | undefined>(undefined);
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>(undefined);

  // sort by state
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt" | "updatedAt">("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const debouncedSearch = useDebounce(search, 500);

  const { data , isLoading, isError, error} = useQuery(trpc.user.get.queryOptions({ limit, page, search: debouncedSearch, rolesFilter, bannedFilter, verifiedFilter, sortBy, sortDirection}));

  return (
    <DataTableTemplate isError={isError} error={error} sortByComponents={<SortByUsers sortBy={sortBy} setSortBy={setSortBy} sortDirection={sortDirection} setSortDirection={setSortDirection} />} filterComponents={<FilterUsers  rolesFilter={rolesFilter} setRolesFilter={setRolesFilter} bannedFilter={bannedFilter} setBannedFilter={setBannedFilter} verifiedFilter={verifiedFilter} setVerifiedFilter={setVerifiedFilter} />} onPageChange={(page: number) => setPage(page)}columns={columns(page, limit)} data={data?.users || []} searchPlaceHolder="Search by name or email"  metadata={data?.meta} isLoading={isLoading} onNextPage={() => setPage(page + 1)} onPrevPage={() => setPage(page - 1)} onLimitChange={(limit) => setLimit(limit)} onSearchChange={(search) => setSearch(search)} />
  );
}
