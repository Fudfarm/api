import { Request, Response } from "express";
import { getOrCreateSystemInfo } from "./helper";
import { handleError } from "../../../function/error";

// 🟩 GET TERMS & CONDITIONS
export const getToc = async (req: Request, res: Response) => {
  try {
    const info = await getOrCreateSystemInfo();
    return res.status(200).json({
      message: "Terms and Conditions retrieved successfully",
      data: { toc: info.toc },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving Terms & Conditions");
  }
};

// 🟦 UPDATE TERMS & CONDITIONS
export const updateToc = async (req: Request, res: Response) => {
  try {
    const { toc } = req.body;

    const info = await getOrCreateSystemInfo();
    info.toc = toc;
    await info.save();

    return res.status(200).json({
      message: "Terms and Conditions updated successfully",
      data: { toc: info.toc },
    });
  } catch (error) {
    return handleError(error, res, "Error updating Terms & Conditions");
  }
};
