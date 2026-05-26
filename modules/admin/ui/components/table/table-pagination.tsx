import { type Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  onNextPage: () => void;
  onPrevPage: () => void;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  total: number;
  limit: number;
  totalPages: number;
}

export function DataTablePagination<TData>({
  table,
  onLimitChange,
  onNextPage,
  onPrevPage,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  currentPage,
  totalPages,
  total,
  limit,
}: DataTablePaginationProps<TData>) {
  const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);
  return (
    <div className="flex items-center flex-col md:flex-row gap-2 md:px-1">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing <span className="font-medium">{start}</span> to{" "}
        <span className="font-medium">{end}</span> of{" "}
        <span className="font-medium">{total}</span> entries
      </div>
      <div className="flex w-full md:w-fit space-x-6 lg:space-x-8 justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium mr-2">Rows per page</p>
          <Select
            value={`${limit}`}
            disabled={totalPages === 0}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger size="sm" className="p-1 ">
              <SelectValue placeholder={`${limit}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`} disabled={totalPages === 0 || pageSize >= limit * totalPages}>
                  {totalPages === 0 ? "0" : pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden md:flex w-25 items-center justify-center text-sm font-medium ml-2">
          Page {totalPages === 0 ? 0 : currentPage} of{" "}
          {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={!hasPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={onPrevPage}
            disabled={!hasPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={onNextPage}
            disabled={!hasNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => onPageChange(table.getPageCount())}
            disabled={!hasNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
        </div>
         <div className="flex md:hidden items-start w-full text-sm font-medium">
          Page {totalPages === 0 ? 0 : currentPage} of{" "}
          {totalPages}
      </div>
    </div>
  );
}
