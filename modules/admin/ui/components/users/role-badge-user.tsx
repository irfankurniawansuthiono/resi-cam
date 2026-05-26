import { Badge } from "@/components/ui/badge";
export default function UserRoleBadge({ role }: { role: string }) {
    const color = {
        admin: "bg-blue-500", // stabil, terpercaya
        user: "bg-gray-500", // netral
    };
    return <Badge className={color[role as keyof typeof color]}>{role.toUpperCase()}</Badge>;
}
