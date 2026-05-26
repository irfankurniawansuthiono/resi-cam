// app/api/upload/delete/route.ts
import { getSession } from "@/hooks/get-session";
import { role } from "@/modules/admin/ui/config/auth/role.user";
import { unlink } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    const session = await getSession();
    const userRole = session?.user.role;

    if (userRole !== role.admin) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
        return Response.json({ error: "No URL provided" }, { status: 400 });
    }

    try {
        // ubah URL jadi path file
        const filePath = path.join(process.cwd(), "public", url);

        await unlink(filePath);

        return Response.json({ success: true });
    } catch (err) {
        console.error(err);
        return Response.json({ error: "Failed to delete file" }, { status: 500 });
    }
}
