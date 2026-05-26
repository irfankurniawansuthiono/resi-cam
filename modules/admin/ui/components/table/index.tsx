"use client";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, VisibilityState } from "@tanstack/react-table";
import { DataTablePagination } from "./table-pagination";

// import { type Table } from "@tanstack/react-table";
import { ChevronDown, Info } from "lucide-react";

import { appToast } from "@/components/custom/app-toast";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search } from "lucide-react";
import { useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchPlaceHolder: string;
    isLoading: boolean;
    currentPageState?: number;
    limitState?: number;
    metadata?: {
        total: number;
        currentPage: number;
        limit: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        nextPage: number | null;
        previousPage: number | null;
        totalPages: number;
    };
    isError: boolean;
    error?: any;
    onLimitChange: (limit: number) => void;
    onNextPage: () => void;
    onPrevPage: () => void;
    onSearchChange: (search: string) => void;
    onPageChange: (page: number) => void;
    filterComponents?: React.ReactNode;
    sortByComponents?: React.ReactNode;
}

export function DataTableTemplate({
    columns,
    data,
    filterComponents,
    sortByComponents,
    metadata,
    searchPlaceHolder,
    isLoading = true,
    isError = false,
    error,
    onNextPage,
    onPrevPage,
    onLimitChange,
    onSearchChange,
    onPageChange,
}: DataTableProps<any, any>) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: metadata?.totalPages,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            columnVisibility,
            pagination: {
                pageIndex: metadata?.currentPage ? metadata?.currentPage - 1 : 0,
                pageSize: metadata?.limit || 10,
            },
        },
    });
    if (isError) {
        return appToast.error(error?.message || "Something went wrong! Please try again.");
    }
    return (
        <div className="space-y-4">
            <div className="flex gap-2 justify-between md:gap-0 md:flex-row flex-col items-start md:items-center">
                {/* search input with icon */}
                <div className="flex items-center">
                    <Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <Search size={16} />
                            </InputGroupAddon>
                            <InputGroupInput
                                disabled={isLoading}
                                className="disabled:cursor-not-allowed"
                                type="search"
                                data-slot="search"
                                placeholder={searchPlaceHolder}
                                onChange={e => onSearchChange(e.target.value)}
                            />
                        </InputGroup>
                    </Label>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="link" size="icon">
                                <Info size={16} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{searchPlaceHolder}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex gap-2 md:flex-row flex-col items-start md:items-center ">
                    {/* sort button */}
                    {sortByComponents}
                    {/* filter button */}
                    {filterComponents}
                    {/* toggle column visibility */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Columns <ChevronDown className="ml-2 size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter(column => column.getCanHide())
                                .map(column => (
                                    <DropdownMenuCheckboxItem
                                        checked={column.getIsVisible()}
                                        className="capitalize"
                                        key={column.id}
                                        onSelect={e => e.preventDefault()}
                                        onCheckedChange={value => column.toggleVisibility(!!value)}
                                    >
                                        {typeof column.columnDef.header === "string"
                                            ? column.columnDef.header
                                            : column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {/* table component start */}
            <div className="overflow-hidden rounded-md border w-full ">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow key="loading">
                                <TableCell colSpan={columns.length}>
                                    <div className="flex gap-2 items-center justify-center">
                                        <Spinner />
                                        <h1 className="">Getting data...</h1>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {metadata && (
                <DataTablePagination
                    onPageChange={onPageChange}
                    limit={metadata.limit}
                    total={metadata.total}
                    totalPages={metadata.totalPages}
                    currentPage={metadata.currentPage}
                    hasNextPage={metadata.hasNextPage}
                    onLimitChange={onLimitChange}
                    hasPreviousPage={metadata.hasPreviousPage}
                    onNextPage={onNextPage}
                    onPrevPage={onPrevPage}
                    table={table}
                />
            )}
        </div>
    );
}
