import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import { generateUniqueToken } from "../utils";

interface User extends Document {
  name: string;
  email: string;
  password: string;
  address: string;
  phone: number;
  role: string;
  createdAt: Date;
  isEmailVerified: boolean;
  verificationToken: string;
  resetToken: string;
  tokenExpiryIn: number | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<User> = new Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: "Please enter a valid email address",
    },
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  address: {
    type: String,
    required: false,
  },
  phone: {
    type: Number,
    required: false,
    minlength: [10, "Password must be at least 10 characters"],
    maxlength: [14, "Password must be at least 14 characters"],
  },
  role: {
    type: String,
    enum: {
      values: ["user", "admin"],
    },
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: false,
  },
  resetToken: {
    type: String,
    required: false,
  },
  tokenExpiryIn: {
    type: Number,
    required: false,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model<User>("User", UserSchema);
