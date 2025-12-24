import bcrypt from "bcrypt";
import mongoose, { Document, Model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IUser, IUserMethods, USER_STATUSES } from "../../interface/user";

type UserDocument = IUser & Document & IUserMethods;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const userSchema = new Schema<UserDocument>(
  {
    _id: {type: String, default: uuidv4},
    offlineID: { type: String, default: "" },
    email: { type: String, unique: true, lowercase: true, trim: true},
    password: { type: String, required: true},
    birthdate: { type: Date, required: true},
    firstname: { type: String, required: true},
    gender: { type: String, required: true},
    maritalStatus: { type: String, required: true},
    otherInfo: { type: String, default: ""},
    othernames: { type: String, default: ""},
    surname: { type: String, required: true},
    phone: { type: String, required: false},
    noOfFamily: { type: Number, default: 0, required: false},
    disease: { type: String, default: "", required: false},
    role: { type: String, required: true},
    status: { type: String, enum: USER_STATUSES, default: "Pending"},
    lastLoginAt: { type: Date, default: null},
    isVerified: { type: Boolean, default: false},
    allowNotifications: { type: Boolean, default: true},
    createdBy: { type: String, required: false},
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
    _id: false,
    versionKey: false,
    toJSON: {
      getters: true,
      transform: (_, ret) => {
        if (ret._id) ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: { getters: true },
  }
);

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

// Middleware: Hash password before saving
userSchema.pre("save", async function (this: UserDocument, next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

const User: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  userSchema
);

export default User;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
