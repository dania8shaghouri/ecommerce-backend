import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { orderModel } from "../models/orderModel.js";

interface RegisterParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const generateJWT = (data: any) => {
  return jwt.sign(data, process.env.JWT_SECRET || "");
};

// ---------------- REGISTER ----------------
export const register = async ({
  firstName,
  lastName,
  email,
  password,
}: RegisterParams) => {
  const findUser = await userModel.findOne({ email });

  if (findUser) {
    throw new Error("User already exists!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new userModel({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role: "customer",
  });

  await newUser.save();

  return {
    // token: generateJWT({ firstName, lastName, email }),
    message: "Registration successful",
  };
};

// ---------------- LOGIN ----------------
interface LoginParams {
  email: string;
  password: string;
}

export const login = async ({ email, password }: LoginParams) => {
  const findUser = await userModel.findOne({ email });

  if (!findUser) {
    throw new Error("Incorrect email or password");
  }

  const passwordMatch = await bcrypt.compare(password, findUser.password);

  if (!passwordMatch) {
    throw new Error("Incorrect email or password");
  }
  if (!findUser.role) {
    findUser.role = "customer";
    await findUser.save();
  }

  return {
    token: generateJWT({
      email,
      firstName: findUser.firstName,
      lastName: findUser.lastName,
      role: findUser.role,
    }),
    role: findUser.role,
    message: "Login successful",
  };
};

// ---------------- ORDERS ----------------
interface GetMyOrdersParams {
  userId: string;
}

export const getMyOrders = async ({ userId }: GetMyOrdersParams) => {
  const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });

  return orders;
};
