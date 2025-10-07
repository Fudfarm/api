import bcrypt from "bcrypt";
import { Schema } from "mongoose";

/**
 * Mongoose plugin to hash passwords and add comparePassword method.
 * @param {Schema} schema The Mongoose schema to apply the password plugin to.
 * This plugin hashes the password before saving and provides a method to compare passwords.
 */
export function passwordPlugin(schema: Schema) {
  schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  });

  schema.methods.comparePassword = function (candidate: string) {
    return bcrypt.compare(candidate, this.password);
  };
}
