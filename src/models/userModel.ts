import mongoose, { Schema, Document } from "mongoose";
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "customer" | "admin";
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100,
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
});

const userModel = mongoose.model<IUser>("User", userSchema);

export default userModel;
