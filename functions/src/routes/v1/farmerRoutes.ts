import express from "express";
import { getFarmerAddress } from "../../controllers/v1/farmer/details/address";
import { getFarmerAnimalList } from "../../controllers/v1/farmer/details/animal_list";
import { getFarmerBank } from "../../controllers/v1/farmer/details/bank";
import { getFarmerBiodata } from "../../controllers/v1/farmer/details/biodata";
import { getFarmerBusinessType } from "../../controllers/v1/farmer/details/business_type";
import { getFarmerContact } from "../../controllers/v1/farmer/details/contact";
import { getFarmerFarmInfoList } from "../../controllers/v1/farmer/details/farm_info_list";
import { getFarmerHarvestPerCropList } from "../../controllers/v1/farmer/details/harvest_per_crop";
import { getFarmerOccupation } from "../../controllers/v1/farmer/details/occupation";
import { getFarmerOtherFarmInfo } from "../../controllers/v1/farmer/details/other_farm_info";
import { getFarmerShopItemList } from "../../controllers/v1/farmer/details/shop_items";
import { getFarmerShopLocationList } from "../../controllers/v1/farmer/details/shop_location";
import { getFarmerSubmission } from "../../controllers/v1/farmer/details/submission";
import { getFarmerVerification } from "../../controllers/v1/farmer/details/verification";
import { getFarmerWorkForce } from "../../controllers/v1/farmer/details/work_force";
import { editFarmerAddress } from "../../controllers/v1/farmer/edit/address";
import { editFarmerAnimal } from "../../controllers/v1/farmer/edit/animal";
import { editFarmerBank } from "../../controllers/v1/farmer/edit/bank";
import { editFarmerBiodata } from "../../controllers/v1/farmer/edit/biodata";
import { editFarmerBusinessType } from "../../controllers/v1/farmer/edit/business_type";
import { editFarmerContact } from "../../controllers/v1/farmer/edit/contact";
import { editFarmerCrop } from "../../controllers/v1/farmer/edit/crop";
import { editFarmerFarm } from "../../controllers/v1/farmer/edit/farm_info";
import { editFarmerOccupation } from "../../controllers/v1/farmer/edit/occupation";
import { editFarmerOtherFarmInfo } from "../../controllers/v1/farmer/edit/other_farm_info";
import { editFarmerShopItem } from "../../controllers/v1/farmer/edit/shop_items";
import { editFarmerShopLocation } from "../../controllers/v1/farmer/edit/shop_location";
import { updateFarmerRecordStatus } from "../../controllers/v1/farmer/edit/status";
import { editFarmerVerification } from "../../controllers/v1/farmer/edit/verification";
import { editFarmerWorkForce } from "../../controllers/v1/farmer/edit/work_force";
import { farmersList } from "../../controllers/v1/farmer/list";
import { farmersUpload } from "../../controllers/v1/farmer/upload";
import { USER_ROLES } from "../../interface/user";
import { AuthGuard } from "../../middleware/auth";
import { validateM } from "../../middleware/validate";
import { addressSchema } from "../../validators/farmer/address";
import { animalSchema } from "../../validators/farmer/animal";
import { bankSchema } from "../../validators/farmer/bank";
import { biodataSchema } from "../../validators/farmer/biodata";
import { businessTypeSchema } from "../../validators/farmer/business_type";
import { contactSchema } from "../../validators/farmer/contact";
import { cropSchema } from "../../validators/farmer/crop";
import { farmSchema } from "../../validators/farmer/farm";
import { occupationSchema } from "../../validators/farmer/occupation";
import { otherFarmInfoSchema } from "../../validators/farmer/other_farm_info";
import { shopItemSchema } from "../../validators/farmer/shop_items";
import { shopLocationSchema } from "../../validators/farmer/shop_location";
import { submissionSchema } from "../../validators/farmer/submission";
import { verificationSchema } from "../../validators/farmer/verification";
import { workForceSchema } from "../../validators/farmer/work_force";

const farmerRouter = express.Router();

farmerRouter.post("/upload", AuthGuard(["Field Officer"]), farmersUpload);
farmerRouter.get("/list", AuthGuard([...USER_ROLES]), farmersList);

// details sub-router mounted at /details
const details = express.Router();
const edit = express.Router();
const validate = express.Router();

details.get("/biodata/:id", getFarmerBiodata);
edit.put("/biodata/:id", validateM(biodataSchema), editFarmerBiodata);

details.get("/contact/:id", getFarmerContact);
edit.put("/contact/:id", validateM(contactSchema), editFarmerContact);

details.get("/verification/:id", getFarmerVerification);
edit.put("/verification/:id", validateM(verificationSchema), editFarmerVerification);

details.get("/address/:id", getFarmerAddress);
edit.put("/address/:id", validateM(addressSchema), editFarmerAddress);

details.get("/bank/:id", getFarmerBank);
edit.put("/bank/:id", validateM(bankSchema), editFarmerBank);

details.get("/occupation/:id", getFarmerOccupation);
edit.put("/occupation/:id", validateM(occupationSchema), editFarmerOccupation);

details.get("/business-type/:id", getFarmerBusinessType);
edit.put("/business-type/:id", validateM(businessTypeSchema), editFarmerBusinessType);

details.get("/shop-list/:id", getFarmerShopLocationList);
edit.put("/shop-list/:id", validateM(shopLocationSchema), editFarmerShopLocation);

details.get("/shop-items/:shopId", getFarmerShopItemList);
edit.put("/shop-items/:itemId", validateM(shopItemSchema), editFarmerShopItem);

details.get("/farm-list/:id", getFarmerFarmInfoList);
edit.put("/farm/:farmId", validateM(farmSchema), editFarmerFarm);

details.get("/crop-list/:id", getFarmerHarvestPerCropList);
edit.put("/crop/:cropId", validateM(cropSchema), editFarmerCrop);

details.get("/animal-list/:id", getFarmerAnimalList);
edit.put("/animal/:animalId", validateM(animalSchema), editFarmerAnimal);

details.get("/other-farm-info/:id", getFarmerOtherFarmInfo);
edit.put("/other-farm-info/:id", validateM(otherFarmInfoSchema), editFarmerOtherFarmInfo);

details.get("/work-force/:id", getFarmerWorkForce);
edit.put("/work-force/:id", validateM(workForceSchema), editFarmerWorkForce);

details.get("/submission/:id", getFarmerSubmission);

farmerRouter.use("/details", AuthGuard([...USER_ROLES]), details);
farmerRouter.use("/edit", AuthGuard([...USER_ROLES]), edit);

// management
validate.put("/update-record-status/:id", validateM(submissionSchema), updateFarmerRecordStatus);
farmerRouter.use("/validate", AuthGuard(["Admin"]), validate);

export default farmerRouter;
