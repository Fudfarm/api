import { Response } from "express";
import { randomPassword } from "../../../function/function3";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { cleanStr } from "../../../function/function1";
import { IUserRole } from "../../../interface/user";
import User from "../../../models/v1/User";
import { sendEmail } from "../../../utils/mailer";
import { staffOnboardingWelcomeBody } from "../../../emails/onboardWelcome";
import { config } from "../../../config";

export const onboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = fields(req);

    const emailExists = await User.exists({ email: data.email });
    if (emailExists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Generate a random secure password to avoid impersonation
    const password = randomPassword(20);

    const newUser = new User({
      surname: data.surname,
      firstname: data.firstname,
      othernames: data.othernames,
      gender: data.gender,
      maritalStatus: data.maritalStatus,
      birthdate: data.birthdate,
      email: data.email,
      phone: data.phone,
      otherInfo: data.otherInfo,
      role: data.role,
      password,
      createdBy: req.user?.id,
    });

    await newUser.save();

    await sendEmail({
      to: data.email,
      subject: `Welcome to the Team | ${config.appName}`,
      title: "Welcome Aboard",
      body: staffOnboardingWelcomeBody({
        name: data.surname,
      }),
    });

    return res.status(201).json({
      message: "User onboarded successfully",
      user: {
        id: newUser._id,
        surname: newUser.surname,
        firstname: newUser.firstname,
        othernames: newUser.othernames,
        gender: newUser.gender,
        maritalStatus: newUser.maritalStatus,
        birthdate: newUser.birthdate,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Error creating user", error });
  }
};

/**
 * Extracts and cleans input fields from the request body.
 * @param {AuthenticatedRequest} req - The incoming request.
 * @return {object} - The sanitized user data fields.
 */
export function fields(req: AuthenticatedRequest) {
  return {
    id: cleanStr(req.body.id) || undefined,

    surname: cleanStr(req.body.surname),
    firstname: cleanStr(req.body.firstname),
    othernames: cleanStr(req.body.othernames),
    gender: cleanStr(req.body.gender),
    maritalStatus: cleanStr(req.body.maritalStatus),
    birthdate: cleanStr(req.body.birthdate),
    email: cleanStr(req.body.email).toLowerCase(),
    phone: cleanStr(req.body.phone),
    otherInfo: cleanStr(req.body.otherInfo),
    role: cleanStr(req.body.role) as IUserRole,
  };
}
