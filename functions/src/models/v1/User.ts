import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { IUser, IUserMethods, USER_STATUSES, USER_ROLES } from "../../interface/user";

type UserDocument = IUser & Document & IUserMethods;

const userSchema = new Schema<UserDocument>(
  {
    _id: { type: String, default: uuidv4 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    birthdate: { type: Date, required: true },
    firstname: { type: String, required: true },
    gender: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    otherInfo: { type: String, default: "" },
    othernames: { type: String, required: true },
    surname: { type: String, required: true },
    phone: { type: String },
    noOfFamily: { type: Number, default: 0 },
    disease: { type: String, default: "" },
    role: { type: String, enum: USER_ROLES, required: true },
    status: { type: String, enum: USER_STATUSES, default: "Pending" },
    lastLoginAt: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    _id: false,
    versionKey: false,
    toJSON: {
      getters: true,
      virtuals: true,
      transform: (_, ret) => {
        if (ret._id) ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: { getters: true, virtuals: true },
  }
);

// Middleware: Hash password before saving
userSchema.pre("save", async function (this: UserDocument, next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

// Methods
userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

// Model
const User: Model<UserDocument> = mongoose.model<UserDocument>("User", userSchema);
export default User;

// Utilities
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
