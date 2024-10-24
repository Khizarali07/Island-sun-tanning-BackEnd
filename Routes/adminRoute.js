const express = require("express");
const adminController = require("../Controllers/adminController");

const router = express.Router();

router.route("/login").post(adminController.login);
router.route("/signup").post(adminController.signup);

router.route("/admin/forgot-password").post(adminController.forgetPassword);
router.route("/admin/reset-password").post(adminController.resetPassword);

module.exports = router;
