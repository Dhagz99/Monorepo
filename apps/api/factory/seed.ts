import seedRoles from "./seed/role.seed";


async function main() {


   await seedRoles();



   console.log(
      "All seeds completed"
   );

}

main()
   .catch((error) => {

      console.error(error);

      process.exit(1);

   });