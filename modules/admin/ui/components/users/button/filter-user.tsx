/*
filter by roles
filter by banned status(banned or not)
filter by email verified or not
*/

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ButtonWithIcon } from "@/components/custom/button-with-icon";
import { Check, Funnel, FunnelPlus, FunnelX, X } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { roleList } from "../../../config/auth/role.user";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FilterUsers({
  rolesFilter,
  setRolesFilter,
  bannedFilter,
  setBannedFilter,
  verifiedFilter,
  setVerifiedFilter,
}: {
  rolesFilter: (typeof roleList)[number][];
  setRolesFilter: (rolesFilter: (typeof roleList)[number][]) => void;
  bannedFilter: boolean | undefined;
  setBannedFilter: (bannedFilter: boolean | undefined) => void;
  verifiedFilter: boolean | undefined;
  setVerifiedFilter: (verifiedFilter: boolean | undefined) => void;
}) {

  const filtersCount = {
    roles: rolesFilter.length,
    banned: bannedFilter === undefined ? 0 : 1,
    verified: verifiedFilter === undefined ? 0 : 1,
  };
  const filterTotal = Object.values(filtersCount).reduce((a, b) => a + b, 0);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <ButtonWithIcon variant="outline" startIcon={<FunnelPlus />}>
          Filters
          <span className="p-0 m-0">({filterTotal})</span>
        </ButtonWithIcon>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Funnel size={15} />
            User Filters
          </SheetTitle>
          <SheetDescription>
            Filter by role, banned status, and email verification.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <div className="flex items-end justify-end ">
            <ButtonWithIcon
              variant="default"
              startIcon={<FunnelX />}
              onClick={() => {
                setRolesFilter([]);
                setBannedFilter(undefined);
                setVerifiedFilter(undefined);
              }}
            >
              Clear Filters
            </ButtonWithIcon>
          </div>
          {/* role list */}
          <div className="flex flex-col gap-2">
            <h1>Role:</h1>
            <div className="space-y-2 space-x-2">
              {roleList.map((role) => (
                <Toggle
                  key={role}
                  variant="outline"
                  aria-label={role}
                  pressed={rolesFilter.includes(role)}
                  onPressedChange={(pressed) => {
                    setRolesFilter(
                      pressed
                        ? [...rolesFilter, role]
                        : rolesFilter.filter((r: string) => r !== role),
                    );
                  }}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Toggle>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h1>Banned:</h1>
            <div className="flex items-center gap-2">
              <Select
                value={
                  bannedFilter === undefined
                    ? "undefined"
                    : bannedFilter.toString()
                }
                onValueChange={(value) =>
                  setBannedFilter(
                    value === "undefined" ? undefined : value === "true",
                  )
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue
                    placeholder={
                      bannedFilter === undefined
                        ? "All"
                        : bannedFilter
                          ? "Yes"
                          : "No"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="undefined">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h1>Email Verified:</h1>
            <div className="flex items-center gap-2">
              <Select
                value={
                  verifiedFilter === undefined
                    ? "undefined"
                    : verifiedFilter.toString()
                }
                onValueChange={(value) =>
                  setVerifiedFilter(
                    value === "undefined" ? undefined : value === "true",
                  )
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue
                    placeholder={
                      verifiedFilter === undefined
                        ? "All"
                        : verifiedFilter
                          ? "Yes"
                          : "No"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="undefined">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
