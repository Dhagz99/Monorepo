import express from "express";
import { CreateUserSchema } from "@repo/shared";

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


const test = () => {
  const result = CreateUserSchema.safeParse({
    name: "John",
    email: "john@email.com",
    password: "123456",
  });

  console.log(result);
};

test();

app.listen(5000, () => {
  console.log("API running on port 5000");
});