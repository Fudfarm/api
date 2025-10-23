import express from "express";
import { getFarmerAddress } from "../../controllers/v1/farmer/details/address";
import { getFarmerAnimalList } from "../../controllers/v1/farmer/details/animal_list";
import { getFarmerBank } from "../../controllers/v1/farmer/details/bank";
import { getFarmerBiodata } from "../../controllers/v1/farmer/details/biodata";
import { getFarmerBusinessType } from "../../controllers/v1/farmer/details/business_type";
import { getFarmerConsent } from "../../controllers/v1/farmer/details/consent";
import { getFarmerContact } from "../../controllers/v1/farmer/details/contact";
import { getFarmerFarmInfoList } from "../../controllers/v1/farmer/details/farm_info_list";
import { getFarmerHarvestPerCropList } from "../../controllers/v1/farmer/details/harvest_per_crop";
import { getFarmerImage } from "../../controllers/v1/farmer/details/image";
import { getFarmerOccupation } from "../../controllers/v1/farmer/details/occupation";
import { getFarmerOtherFarmInfo } from "../../controllers/v1/farmer/details/other_farm_info";
import { getFarmerShopItemList } from "../../controllers/v1/farmer/details/shop_items";
import { getFarmerShopLocationList } from "../../controllers/v1/farmer/details/shop_location";
import { getFarmerSubmission } from "../../controllers/v1/farmer/details/submission";
import { getFarmerVerification } from "../../controllers/v1/farmer/details/verification";
import { getFarmerWorkForce } from "../../controllers/v1/farmer/details/work_force";
import { editFarmerAddress } from "../../controllers/v1/farmer/edit/address";
import { addFarmerAnimal, destroyFarmerAnimal, editFarmerAnimal } from "../../controllers/v1/farmer/edit/animal";
import { editFarmerBank } from "../../controllers/v1/farmer/edit/bank";
import { editFarmerBiodata } from "../../controllers/v1/farmer/edit/biodata";
import { editFarmerBusinessType } from "../../controllers/v1/farmer/edit/business_type";
import { updateConsentStatus } from "../../controllers/v1/farmer/edit/consent";
import { editFarmerContact } from "../../controllers/v1/farmer/edit/contact";
import { addFarmerCrop, destroyFarmerCrop, editFarmerCrop } from "../../controllers/v1/farmer/edit/crop";
import { addFarmerFarm, destroyFarmerFarm, editFarmerFarm } from "../../controllers/v1/farmer/edit/farm_info";
import { updateImageStatus } from "../../controllers/v1/farmer/edit/image";
import { editFarmerOccupation } from "../../controllers/v1/farmer/edit/occupation";
import { editFarmerOtherFarmInfo } from "../../controllers/v1/farmer/edit/other_farm_info";
import {
  addFarmerShopItem,
  destroyFarmerShopItem,
  editFarmerShopItem,
} from "../../controllers/v1/farmer/edit/shop_items";
import {
  addFarmerShopLocation,
  destroyFarmerShopLocation,
  editFarmerShopLocation,
} from "../../controllers/v1/farmer/edit/shop_location";
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
import { imageSchema } from "../../validators/farmer/image";
import { occupationSchema } from "../../validators/farmer/occupation";
import { otherFarmInfoSchema } from "../../validators/farmer/other_farm_info";
import { shopItemSchema } from "../../validators/farmer/shop_items";
import { shopLocationSchema } from "../../validators/farmer/shop_location";
import { submissionSchema } from "../../validators/farmer/submission";
import { verificationSchema } from "../../validators/farmer/verification";
import { videoSchema } from "../../validators/farmer/video";
import { workForceSchema } from "../../validators/farmer/work_force";

const farmerRouter = express.Router();

farmerRouter.post("/upload", AuthGuard(["Field Officer"]), farmersUpload);
farmerRouter.get("/list", AuthGuard([...USER_ROLES]), farmersList);

// details sub-router mounted at /details
const details = express.Router();
const edit = express.Router();
const add = express.Router();
const destroy = express.Router();
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
edit.put("/shop-location/:shopId", validateM(shopLocationSchema), editFarmerShopLocation);
add.post("/shop-location/:userId", validateM(shopLocationSchema), addFarmerShopLocation);
destroy.delete("/shop-location/:shopId", destroyFarmerShopLocation);

details.get("/shop-items/:shopId", getFarmerShopItemList);
edit.put("/shop-item/:itemId", validateM(shopItemSchema), editFarmerShopItem);
add.post("/shop-item/:shopId", validateM(shopItemSchema), addFarmerShopItem);
destroy.delete("/shop-item/:itemId", destroyFarmerShopItem);

details.get("/farm-list/:id", getFarmerFarmInfoList);
edit.put("/farm/:farmId", validateM(farmSchema), editFarmerFarm);
add.post("/farm/:userId", validateM(farmSchema), addFarmerFarm);
destroy.delete("/farm/:farmId", destroyFarmerFarm);

details.get("/crop-list/:id", getFarmerHarvestPerCropList);
edit.put("/crop/:cropId", validateM(cropSchema), editFarmerCrop);
add.post("/crop/:userId", validateM(cropSchema), addFarmerCrop);
destroy.delete("/crop/:cropId", destroyFarmerCrop);

details.get("/animal-list/:id", getFarmerAnimalList);
edit.put("/animal/:animalId", validateM(animalSchema), editFarmerAnimal);
add.post("/animal/:userId", validateM(animalSchema), addFarmerAnimal);
destroy.delete("/animal/:animalId", destroyFarmerAnimal);

details.get("/other-farm-info/:id", getFarmerOtherFarmInfo);
edit.put("/other-farm-info/:id", validateM(otherFarmInfoSchema), editFarmerOtherFarmInfo);

details.get("/work-force/:id", getFarmerWorkForce);
edit.put("/work-force/:id", validateM(workForceSchema), editFarmerWorkForce);

details.get("/submission/:id", getFarmerSubmission);
details.get("/image/:id", getFarmerImage);
details.get("/consent/:id", getFarmerConsent);

// management
edit.put("/image-status/:id", validateM(imageSchema), updateImageStatus);
edit.put("/consent-status/:id", validateM(videoSchema), updateConsentStatus);

validate.put("/update-record-status/:id", validateM(submissionSchema), updateFarmerRecordStatus);
farmerRouter.use("/validate", AuthGuard(["Admin"]), validate);


farmerRouter.use("/details", AuthGuard([...USER_ROLES]), details);
farmerRouter.use("/edit", AuthGuard([...USER_ROLES]), edit);
farmerRouter.use("/add", AuthGuard([...USER_ROLES]), add);
farmerRouter.use("/destroy", AuthGuard([...USER_ROLES]), destroy);

export default farmerRouter;
