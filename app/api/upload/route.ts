// app/api/upload/route.ts
import { getSession } from "@/hooks/get-session";
import { role } from "@/modules/admin/ui/config/auth/role.user";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    const session = await getSession();
    const userRole = session?.user.role;

    if (userRole !== role.admin) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const pathname = formData.get("pathname") as string;

    if (!file) {
        return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // ambil extension asli
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const uploadDir = path.join(process.cwd(), "/uploads", pathname);

    // pastikan folder ada
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    return Response.json({
        url: `/uploads/${pathname}/${fileName}`,
    });
}
