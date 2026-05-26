import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownAz, ArrowDownZA } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
export default function SortByUsers({
  // desc/asc Button
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
}: {
  sortBy: "name" | "email" | "createdAt" | "updatedAt";
  setSortBy: (sortBy: "name" | "email" | "createdAt" | "updatedAt") => void;
  sortDirection: "asc" | "desc" ;
  setSortDirection: (sortDirection: "asc" | "desc") => void;
}) {
  return (
    <ButtonGroup orientation="horizontal">
      {/* desc/asc Button */}
      <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" aria-label={"desc/asc Button"} onClick={()=>{
        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
      }}>
        {sortDirection === "asc" ? (
          <ArrowDownAz />
        ) : (
          <ArrowDownZA />
        )}
      </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{sortDirection === "asc" ? "Ascending" : "Descending"}</p>
      </TooltipContent>
    </Tooltip>
      
      <Select onValueChange={setSortBy} defaultValue={sortBy}>
        <SelectTrigger>
          <SelectValue placeholder={`${sortBy}` || "Sort By"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sort By</SelectLabel>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="createdAt">Created At</SelectItem>
            <SelectItem defaultChecked={true} value="updatedAt">
              Updated At
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </ButtonGroup>
  );
}
