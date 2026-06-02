import "dotenv/config";
import  prisma  from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";
import { createUserService } from "../src/modules/login/login.services.js";

async function main() {
  const Password = "12345678";

  const user = await createUserService({
      email: "financial@example.com",
      name: "Trial User",
      username: "admin1234",
      password: Password,
      roleIds: ["dwad"],
  });

}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



  