import { Request, Response } from "express";
import { getOrCreateSystemInfo } from "./helper";
import { handleError } from "../../../function/error";

// 🟩 GET PRIVACY POLICY
export const getPrivacyPolicy = async (req: Request, res: Response) => {
  try {
    const info = await getOrCreateSystemInfo();
    res.status(200).json({
      message: "Privacy policy retrieved successfully",
      data: { privacyPolicy: info.privacyPolicy },
    });
    return;
  } catch (error) {
    return handleError(error, res, "Error retrieving privacy policy");
  }
};

// 🟦 UPDATE PRIVACY POLICY
export const updatePrivacyPolicy = async (req: Request, res: Response) => {
  try {
    const { privacyPolicy } = req.body;

    const info = await getOrCreateSystemInfo();
    info.privacyPolicy = privacyPolicy;
    await info.save();

    res.status(200).json({
      message: "Privacy policy updated successfully",
      data: { privacyPolicy: info.privacyPolicy },
    });
    return;
  } catch (error) {
    return handleError(error, res, "Error updating privacy policy");
  }
};
