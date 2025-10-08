import express from "express";
import { getContactInfo, updateContactInfo } from "../../controllers/v1/system/contact";
import { getPrivacyPolicy, updatePrivacyPolicy } from "../../controllers/v1/system/privacy";
import { getAboutUs, updateAboutUs } from "../../controllers/v1/system/about";
import { getToc, updateToc } from "../../controllers/v1/system/toc";
import { AuthGuard } from "../../middleware/auth";

const systemInfoRouter = express.Router();

// 🟩 Public routes
systemInfoRouter.get("/contact", getContactInfo);
systemInfoRouter.get("/privacy", getPrivacyPolicy);
systemInfoRouter.get("/about", getAboutUs);
systemInfoRouter.get("/toc", getToc);

// 🟦 Admin-only updates
systemInfoRouter.use(AuthGuard(["Admin"]));

systemInfoRouter.put("/contact", updateContactInfo);
systemInfoRouter.put("/privacy", updatePrivacyPolicy);
systemInfoRouter.put("/about", updateAboutUs);
systemInfoRouter.put("/toc", updateToc);

export default systemInfoRouter;
