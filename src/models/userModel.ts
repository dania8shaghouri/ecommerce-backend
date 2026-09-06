import mongoose, { Schema, Document } from "mongoose";
// IUser yalnızca TypeScript'in derleme zamanında tip kontrolü yapmasını sağlar.
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}
// userSchema veritabanına kaydedilecek verilerin yapısını ve doğrulama kurallarını tanımlar.
const userSchema = new Schema<IUser>(
  {
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
      unique: true,
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
  },
  { timestamps: true },
);

const userModel = mongoose.model<IUser>("User", userSchema);

export default userModel;
