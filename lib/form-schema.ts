import { roleList } from "@/modules/admin/ui/config/auth/role.user";
import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    remember: z.boolean().optional(),
});

export const registerSchema = loginSchema.extend({
    name: z.string().min(2, "Name must be at least 2 characters"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
        const { password, confirmPassword } = data;

        // 🔥 PRIORITAS UTAMA
        if (password !== confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "Password does not match",
                path: ["confirmPassword"],
            });
            return; // ⛔ STOP validasi lain
        }

        // ✅ Validasi lanjutan (hanya kalau sudah match)
        if (confirmPassword.length < 8) {
            ctx.addIssue({
                code: "custom",
                message: "Confirm password must be at least 8 characters",
                path: ["confirmPassword"],
            });
        }

        if (!/[a-z]/.test(confirmPassword) || !/[A-Z]/.test(confirmPassword)) {
            ctx.addIssue({
                code: "custom",
                message: "Password must contain uppercase & lowercase",
                path: ["confirmPassword"],
            });
        }

        if (!/\d/.test(confirmPassword)) {
            ctx.addIssue({
                code: "custom",
                message: "Password must contain number",
                path: ["confirmPassword"],
            });
        }

        if (!/[@$!%*#?&]/.test(confirmPassword)) {
            ctx.addIssue({
                code: "custom",
                message: "Password must contain special character",
                path: ["confirmPassword"],
            });
        }
    });

export const resetPasswordAdminSchema = z
    .object({
        id: z.string(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Password does not match",
        path: ["confirmPassword"],
    });

// Type user schema
export const roleEnum = z.enum(roleList);

export const addUserSchema = registerSchema.extend({
    role: roleEnum,
});

// Type auth form
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordAdminFormValues = z.infer<typeof resetPasswordAdminSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
// Type user form
export type AddUserFormValues = z.infer<typeof addUserSchema>;
