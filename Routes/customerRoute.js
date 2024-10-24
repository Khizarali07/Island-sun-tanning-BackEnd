const express = require("express");
const customerController = require("../Controllers/customerController.js");

const router = express.Router();

router.route("/customers").post(customerController.createCustomer);
router.route("/getCustomers").post(customerController.getCustomer);
router.route("/getAllCustomers").get(customerController.getAllCustomer);
router.route("/redemptions").post(customerController.punchRedemption);
router.route("/revertRedemptions").post(customerController.revertRedemption);

router.route("/getPunchHistory/:date").get(customerController.findPunchHistory);

router
  .route("/deleteCustomerPackage/:id")
  .post(customerController.deleteCustomerPackage);

router
  .route("/updateCustomerPackage/:id")
  .post(customerController.assignPackage);

router.route("/deleteCustomer/:id").delete(customerController.deleteCustomer);
router.route("/updateCustomer/:id").post(customerController.updateCustomer);

module.exports = router;
