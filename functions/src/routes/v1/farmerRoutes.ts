import express from "express";
import { getFarmerAddress } from "../../controllers/v1/farmer/details/address";
import { getFarmerBiodata } from "../../controllers/v1/farmer/details/biodata";
import { getFarmerBusinessType } from "../../controllers/v1/farmer/details/business_type";
import { getFarmerContact } from "../../controllers/v1/farmer/details/contact";
import { getFarmerFarmInfoList } from "../../controllers/v1/farmer/details/farm_info_list";
import { getFarmerOccupation } from "../../controllers/v1/farmer/details/occupation";
import { getFarmerShopLocation } from "../../controllers/v1/farmer/details/shop_location";
import { getFarmerVerification } from "../../controllers/v1/farmer/details/verification";
import { farmersList } from "../../controllers/v1/farmer/list";
import { farmersUpload } from "../../controllers/v1/farmer/upload";
import { USER_ROLES } from "../../interface/user";
import { AuthGuard } from "../../middleware/auth";

const farmerRouter = express.Router();

farmerRouter.post("/upload", AuthGuard(["Field Officer"]), farmersUpload);
farmerRouter.get("/list", AuthGuard([...USER_ROLES]), farmersList);

// route grouping with details as base path /api/v1/farmer
const details = express.Router();
details.use("/biodata/:id", getFarmerBiodata);
details.use("/contact/:id", getFarmerContact);
details.use("/verification/:id", getFarmerVerification);
details.use("/address/:id", getFarmerAddress);
details.use("/bank/:id", getFarmerAddress);
details.use("/occupation/:id", getFarmerOccupation);
details.use("/business-type/:id", getFarmerBusinessType);
details.use("/shop-location/:id", getFarmerShopLocation);
details.use("/farm-info-list/:id", getFarmerFarmInfoList);

farmerRouter.use("/details", AuthGuard([...USER_ROLES]), details);

export default farmerRouter;
