export const role = {
    admin: "admin",
    user: "user",
} as const;

export type RoleUser = (typeof role)[keyof typeof role];

export const roleList = Object.values(role);
