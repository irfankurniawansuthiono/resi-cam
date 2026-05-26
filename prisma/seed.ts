import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

async function main() {
    const newUser = await auth.api.createUser({
        body: {
            email: "admin@gmail.com",
            password: "!Admin1234",
            name: "Admin",
            role: "admin",
        },
    });

    console.log({ newUser });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
