import express from "express";
import { getFarmerAddress } from "../../controllers/v1/farmer/details/address";
import { getFarmerAnimalList } from "../../controllers/v1/farmer/details/animal_list";
import { getFarmerBiodata } from "../../controllers/v1/farmer/details/biodata";
import { getFarmerBusinessType } from "../../controllers/v1/farmer/details/business_type";
import { getFarmerContact } from "../../controllers/v1/farmer/details/contact";
import { getFarmerFarmInfoList } from "../../controllers/v1/farmer/details/farm_info_list";
import { getFarmerHarvestPerCropList } from "../../controllers/v1/farmer/details/harvest_per_crop";
import { getFarmerOccupation } from "../../controllers/v1/farmer/details/occupation";
import { getFarmerOtherFarmInfo } from "../../controllers/v1/farmer/details/other_farm_info";
import { getFarmerShopItemList } from "../../controllers/v1/farmer/details/shop_items";
import { getFarmerShopLocationList } from "../../controllers/v1/farmer/details/shop_location";
import { getFarmerVerification } from "../../controllers/v1/farmer/details/verification";
import { getFarmerWorkForce } from "../../controllers/v1/farmer/details/work_force";
import { farmersList } from "../../controllers/v1/farmer/list";
import { farmersUpload } from "../../controllers/v1/farmer/upload";
import { USER_ROLES } from "../../interface/user";
import { AuthGuard } from "../../middleware/auth";

const farmerRouter = express.Router();

farmerRouter.post("/upload", AuthGuard(["Field Officer"]), farmersUpload);
farmerRouter.get("/list", AuthGuard([...USER_ROLES]), farmersList);

// route grouping with details as base path /api/v1/farmer
const details = express.Router();
details.get("/biodata/:id", getFarmerBiodata);
details.get("/contact/:id", getFarmerContact);
details.get("/verification/:id", getFarmerVerification);
details.get("/address/:id", getFarmerAddress);
details.get("/bank/:id", getFarmerAddress);
details.get("/occupation/:id", getFarmerOccupation);
details.get("/business-type/:id", getFarmerBusinessType);
details.get("/shop-list/:id", getFarmerShopLocationList);
details.get("/shop-items/:shopId", getFarmerShopItemList);
details.get("/farm-list/:id", getFarmerFarmInfoList);
details.get("/crop-list/:id", getFarmerHarvestPerCropList);
details.get("/animal-list/:id", getFarmerAnimalList);
details.get("/other-farm-info/:id", getFarmerOtherFarmInfo);
details.get("/work-force/:id", getFarmerWorkForce);

farmerRouter.use("/details", AuthGuard([...USER_ROLES]), details);

export default farmerRouter;
