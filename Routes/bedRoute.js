const express = require("express");
const bedController = require("../Controllers/bedController.js");

const router = express.Router();

router.route("/createBed").post(bedController.createBed);
router.route("/getBeds").get(bedController.getBeds);
router.route("/getallbeds").get(bedController.getAllBeds);
router.route("/deleteBed/:id").delete(bedController.deleteBed);
router.route("/updateBed/:id").patch(bedController.updateBed);

router.route("/getbeds/:packageID").get(bedController.getBedsfromPackageID);

module.exports = router;
