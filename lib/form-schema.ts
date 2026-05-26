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

// Camera

export const CameraType = z.enum(["WEBCAM", "IPCAM"]);

export const addCameraSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        url: z.string(),
    })
    .superRefine((data, ctx) => {
        const isValidProtocol =
            data.url.startsWith("http://") || data.url.startsWith("https://") || data.url.startsWith("rtsp://");
        if (!isValidProtocol) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "URL must start with http://, https://, or rtsp://",
                path: ["url"],
            });
        }
    });

export const editCameraSchema = addCameraSchema.extend({
    id: z.string(),
});

// barcode
export const barcodeSchema = z.object({
    barcode: z.string().min(8, "Barcode must be at least 8 characters"),
});

export const addWebCameraSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    url: z.string(),
    id: z.string(),
});
export const addRecordSchema = z.object({
    barcodeResi: z.string().min(1, "Barcode tidak boleh kosong"),
    videoPath: z.string().min(1, "Video path wajib diisi"),
    status: z.enum(["processing", "recording", "done", "failed"]),
    sourceType: z.enum(["WEBCAM", "IPCAM"]),
    cameraId: z.string().optional(),
    webCameraSessionId: z.string().optional(),
});

export const addLogsSchema = z.object({
    status: z.enum(["done", "failed"]),
    message: z.string(),
    chunkId: z.string().optional(),
});
export type AddCameraSchema = z.infer<typeof addCameraSchema>;
// Type auth form
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
// Type user form
export type AddUserFormValues = z.infer<typeof addUserSchema>;

// Type Camera form
export type AddCameraFormValues = z.infer<typeof addCameraSchema>;

export type EditCameraFormValues = z.infer<typeof editCameraSchema>;
