import express from "express";
import { getDevices } from "../../controllers/v1/auth/devices";
import {
  getFarmerEnrollmentStats,
  getRecentlyUpdatedFarmerRecords,
} from "../../controllers/v1/auth/userJobStat";
import { contactUs } from "../../controllers/v1/contactUs";
import { feedbackBotContact } from "../../controllers/v1/feedback";
import { getProfile, updateProfile } from "../../controllers/v1/user/getProfile";
import { updateNotification } from "../../controllers/v1/user/updateNotification";
import { updatePassword } from "../../controllers/v1/user/updatePassword";
import { USER_ROLES } from "../../interface/user";
import { AuthGuard } from "../../middleware/auth";
import { validateM } from "../../middleware/validate";
import { contactUsSchema } from "../../validators/contactUs";
import { profileSchema } from "../../validators/staff/profile";

const userRouter = express.Router();


userRouter.use(AuthGuard([...USER_ROLES]));

userRouter.put("/update-password", AuthGuard([...USER_ROLES]), updatePassword);
userRouter.put("/update-notification", AuthGuard([...USER_ROLES]), updateNotification);
userRouter.get("/profile", AuthGuard([...USER_ROLES]), getProfile);
userRouter.put("/profile", AuthGuard(["Admin"]), validateM(profileSchema), updateProfile);

userRouter.post("/contact-us", AuthGuard([...USER_ROLES]), validateM(contactUsSchema), contactUs);
userRouter.post("/feedback", AuthGuard([...USER_ROLES]), feedbackBotContact);
userRouter.post("/devices", AuthGuard([...USER_ROLES]), getDevices);
userRouter.get("/user/statistics/enrollments/:userId", AuthGuard(["Admin"]), getFarmerEnrollmentStats);
userRouter.get("/user/statistics/updates", AuthGuard(["Admin"]), getRecentlyUpdatedFarmerRecords);


export default userRouter;
