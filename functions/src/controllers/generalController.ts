import { Request, Response } from "express";

// Handle home page route
export const getHomePage = (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the Fudfarmer admin API!",
    info: "Feel free to explore the API and use our services.",
  });
};

// Handle health check route
export const getHealthStatus = (req: Request, res: Response) => {
  res.status(200).json({
    message: "Fudfarmer admin API is healthy!",
    timestamp: new Date(),
    status: "OK",
  });
};
