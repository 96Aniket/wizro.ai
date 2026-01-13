import express from "express";
import vmController from "./vmController.js";

const vmRouter = express.Router();

// Existing
vmRouter.get("/getDashboardStats", vmController.getDashboardStats);
vmRouter.get("/getVmUsageStats", vmController.getVmUsageStats);

// Vendor APIs
vmRouter.post("/vendors", vmController.addVendor);
vmRouter.get("/vendors", vmController.getAllVendors);
vmRouter.put("/vendors/:id", vmController.updateVendor);
vmRouter.delete("/vendors/:id", vmController.deleteVendor);
vmRouter.get("/vendors/code/:vendorCode", vmController.getVendorByCode);

// Quotation APIs
vmRouter.post("/quotation", vmController.saveQuotation);
vmRouter.get("/quotation", vmController.getAllQuotations);


export default vmRouter;
