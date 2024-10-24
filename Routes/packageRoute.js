const express = require("express");
const packageController = require("../Controllers/packageController.js");

const router = express.Router();

router.route("/createPackage").post(packageController.createPackage);
router.route("/getPackages").get(packageController.getPackages);
router.route("/deletePackage/:id").delete(packageController.deletePackage);
router.route("/updatePackage/:id").patch(packageController.updatePackage);

module.exports = router;
