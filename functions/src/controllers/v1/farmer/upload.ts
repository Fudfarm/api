import { Request, Response } from "express";
import { handleError } from "../../../function/error";

export const farmersUpload = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    return res.status(200).json({ message: "Data uploaded", data: data });
  } catch (err: any) {
    return handleError(err, res, "Error submitting feedback");
  }
};
