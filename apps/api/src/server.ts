import express from "express";
import { CreateUserSchema } from "@repo/shared";
import prisma from "../lib/prisma";

const app = express();
app.use(express.json());

app.post("/user", (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json(result.error);
  }
  
  res.json({
    message: "Valid data",
    data: result.data,
  });
});


// const test = () => {
//   const result = CreateUserSchema.safeParse({
//     name: "John",
//     email: "john@email.com",
//     password: "123456",
//   });

//   console.log(result);
// };
const test = async () => {
  try {
    const role = await prisma.role.create({
      data: {
        name: "ADMIN",
        description: "Administrator role",
      },
    });

    console.log("Role Created:", role);
  } catch (error) {
    console.log(error);
  }
};

test();

app.listen(5000, () => {
  console.log("API running on port 5000");
});