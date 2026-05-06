import { roleList } from "@/modules/admin/ui/config/auth/role.user";
import { z } from "zod";
import { roleEnum } from "../form-schema";

export const getUserSchema = z.object({
    limit: z.number().min(1).max(100).default(10),
    page: z.number().min(1).default(1),
    search: z.string().optional(),
    rolesFilter: z.array(z.enum(roleList)).default([]).optional(),
    bannedFilter: z.boolean().optional(),
    verifiedFilter: z.boolean().optional(),
    sortBy: z.enum(["name", "email", "createdAt", "updatedAt"]).default("updatedAt").optional(),
    sortDirection: z.enum(["asc", "desc"]).optional(),
});
export const revokeSessionUserSchema = z.object({
    id: z.string(),
});

export const editUserSchema = z.object({
    id: z.string(),
    name: z.string().min(3).max(50),
    email: z.string().email(),
    role: roleEnum,
});

export const deleteUserSchema = z.object({
    id: z.string(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;
