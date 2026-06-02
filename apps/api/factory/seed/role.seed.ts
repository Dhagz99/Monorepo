import prisma from "../../src/lib/prisma";

export default async function seedRoles() {

   const permissions = [

      {
         code: "USER_MANAGE",
         name: "Manage Users"
      },

      {
         code: "ADMIN_MANAGE",
         name: "Manage Admin"
      }

   ];

   for (const p of permissions) {

      await prisma.permission.upsert({

         where: {
            code: p.code
         },

         update: {},

         create: p

      });

   }

   const roles = [

      {
         name: "ADMIN",
         permissions:
            permissions.map(
               (p) => p.code
            )
      }

   ];

   for (const role of roles) {

      const createdRole =
         await prisma.role.upsert({

            where: {
               name: role.name
            },

            update: {},

            create: {
               name: role.name
            }

         });

      for (const code of role.permissions) {

         const permission =
            await prisma.permission.findUnique({

               where: {
                  code
               }

            });

         if (permission) {

            await prisma.rolePermission.upsert({

               where: {

                  roleId_permissionId: {

                     roleId:
                        createdRole.id,

                     permissionId:
                        permission.id

                  }

               },

               update: {},

               create: {

                  roleId:
                     createdRole.id,

                  permissionId:
                     permission.id

               }

            });

         }

      }

   }

   console.log(
      "Roles & permissions seeded"
   );

}