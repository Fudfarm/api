import { Request, Response } from "express";
import { getOrCreateSystemInfo } from "./helper";
import { handleError } from "../../../function/error";

// 🟩 GET ABOUT US
export const getAboutUs = async (req: Request, res: Response) => {
  try {
    const info = await getOrCreateSystemInfo();
    return res.status(200).json({
      message: "About Us retrieved successfully",
      data: { aboutUs: info.aboutUs },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving About Us");
  }
};

// 🟦 UPDATE ABOUT US
export const updateAboutUs = async (req: Request, res: Response) => {
  try {
    const { aboutUs } = req.body;

    const info = await getOrCreateSystemInfo();
    info.aboutUs = aboutUs;
    await info.save();

    return res.status(200).json({
      message: "About Us updated successfully",
      data: { aboutUs: info.aboutUs },
    });
  } catch (error) {
    return handleError(error, res, "Error updating About Us");
  }
};
