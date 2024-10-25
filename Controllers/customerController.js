const Customer = require("../Modals/Customer");
const Package = require("../Modals/Package");

exports.createCustomer = async (req, res, next) => {
  const existingUser = await Customer.findOne({
    phone: req.body.customerData.phone,
  });

  if (existingUser) {
    return res.status(400).json({
      status: "fail",
      message: "Phone number already in use.",
    });
  } else {
    const currentCustomer = await Customer.create(req.body.customerData);

    res.status(200).json({
      status: "success",
      data: { currentCustomer },
    });
  }
  next();
};

exports.getCustomer = async (req, res, next) => {
  const currentCustomer = await Customer.findOne(req.body);

  res.status(200).json({
    status: "success",
    data: { currentCustomer },
  });
  next();
};

exports.getAllCustomer = async (req, res, next) => {
  const customers = await Customer.find();

  res.status(200).json({
    status: "success",
    data: { customers },
  });
  next();
};

exports.deleteCustomerPackage = async (req, res, next) => {
  // Extract customer ID and package ID from the request parameters and body
  const customerId = req.params.id; // Assuming the customer ID is in the URL params
  const packageId = req.body.packageId; // Assuming the package ID is sent in the request body

  // Update the customer by removing the package with the specified packageId
  const updatedCustomer = await Customer.findByIdAndUpdate(
    customerId,
    { $pull: { packages: { packageId } } }, // Use $pull to remove the package
    { new: true, runValidators: true } // Return the updated customer document
  );

  // Check if the customer was found
  if (!updatedCustomer) {
    return res.status(404).json({
      status: "fail",
      message: "Customer not found.",
    });
  }

  // Send the updated customer data in the response
  res.status(200).json({
    status: "success",
    data: updatedCustomer,
  });
  next();
};

exports.assignPackage = async (req, res, next) => {
  const customerId = req.params.id; // Extract customer ID from URL params
  const { selectedPackage } = req.body; // Extract data from request body

  // Find the customer by ID
  const customer = await Customer.findById(customerId);
  if (!customer) {
    return res.status(404).json({
      status: "fail",
      message: "Customer not found.",
    });
  }

  // Create a new package object to add to the customer's packages
  const newPackage = {
    packageId: selectedPackage, // Assuming selectedPackage is the ID of the package
    status: req.body.status,
    remainingRedemptions: req.body.remainingRedemptions,
    assignedDate: new Date(), // Optional: add the assigned date
    expiration: req.body.expiration ? req.body.expiration : null, // Optional: add the expiration date
  };

  // Add the new package to the customer's packages array
  customer.packages.push(newPackage);

  // Save the updated customer document
  await customer.save();

  // Send the response with the updated customer data
  res.status(200).json({
    status: "success",
    data: {
      customer: customer,
    },
  });
};

exports.deleteCustomer = async (req, res, next) => {
  const data = await Customer.deleteOne({ _id: req.params.id });

  res.status(200).json({
    status: "success",
    data: null,
  });
  next();
};

exports.updateCustomer = async (req, res, next) => {
  const updated = await Customer.findByIdAndUpdate(
    req.params.id, // Filter by ID
    req.body // Update data from the request body
  );

  if (!updated) {
    return res.status(404).json({
      status: "fail",
      message: "No package found with that ID",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      package: updated, // Return the updated package
    },
  });
  next();
};

exports.findPunchHistory = async (req, res, next) => {
  const { date } = req.params; // Get date from request parameters
  const formattedDate = new Date(date); // Convert string to Date object

  // Query customers to find punch history entries with the specific date
  const customers = await Customer.aggregate([
    { $unwind: "$punchHistory" }, // Unwind punchHistory array to access individual punch entries
    {
      $match: {
        "punchHistory.date": {
          $gte: new Date(formattedDate.setUTCHours(0, 0, 0, 0)), // Start of the day
          $lt: new Date(formattedDate.setUTCHours(23, 59, 59, 999)), // End of the day
        },
      },
    },
    {
      $lookup: {
        from: "beds", // Join with the "beds" collection
        localField: "punchHistory.bedId", // Field in punchHistory that refers to bed
        foreignField: "_id", // Field in "beds" collection
        as: "bedDetails", // Name of the field to store the joined bed data
      },
    },
    {
      $lookup: {
        from: "packages", // Join with the "packages" collection
        localField: "punchHistory.packageId", // Field in punchHistory that refers to package
        foreignField: "_id", // Field in "packages" collection
        as: "packageDetails", // Name of the field to store the joined package data
      },
    },
    {
      $project: {
        _id: 0, // Exclude the default _id field
        customerName: "$name",
        punchDate: "$punchHistory.date",
        bedName: { $arrayElemAt: ["$bedDetails.name", 0] }, // Extract bed name from the first element in bedDetails
        packageName: { $arrayElemAt: ["$packageDetails.name", 0] }, // Extract package name from the first element in packageDetails
      },
    },
    {
      $sort: { punchDate: 1 }, // Sort results by punch date in ascending order (optional)
    },
  ]);

  console.log(customers);

  if (customers.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No punch history found for the provided date",
    });
  }

  return res.status(200).json({
    status: "success",
    data: {
      customers,
    },
  });

  next();
};

// Function to handle punch redemption
exports.punchRedemption = async (req, res) => {
  try {
    const { customerId, packageId, bedId, consentSignature } = req.body;

    // Step 1: Find the customer
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Step 2: Find the package in the customer's packages array
    const customerPackage = customer.packages.find(
      (pkg) => pkg.packageId.toString() === packageId
    );

    if (!customerPackage) {
      return res
        .status(404)
        .json({ message: "Package not found for this customer" });
    }

    // Step 3: Check if the package is not unlimited and has remaining redemptions
    if (
      customerPackage.expiration === null &&
      customerPackage.remainingRedemptions > 0
    ) {
      customerPackage.status = "redeemed";
      customerPackage.remainingRedemptions -= 1; // Decrease remainingRedemptions by 1

      if (customerPackage.remainingRedemptions === 0) {
        customerPackage.status = "expired"; // Set package status to "Expired" if remainingRedemptions are 0
      }
    }

    // Step 4: Push the new punch history entry
    customer.punchHistory.push({
      packageId,
      bedId,
      consentForm: {
        signature: consentSignature,
      },
    });

    // Step 5: Save the updated customer document
    const updatedCustomer = await customer.save();

    // Check if customer was found and updated
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Respond with the updated customer data
    res.status(200).json({
      status: "success",
      data: {
        package: updatedCustomer, // Return the updated package
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Function to revert (delete) a punch history entry
exports.revertRedemption = async (req, res) => {
  try {
    const { customerId, packageId, punchId } = req.body;

    // Step 1: Find the customer
    const customer = await Customer.findById(customerId);
    const package = await Package.findById(packageId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Step 2: Find the package in the customer's packages array
    const customerPackage = customer.packages.find(
      (pkg) => pkg.packageId.toString() === packageId
    );

    console.log(customerPackage);

    if (!customerPackage) {
      return res
        .status(404)
        .json({ message: "Package not found for this customer" });
    }

    // Step 3: Check if the package is not unlimited and has remaining redemptions
    if (
      customerPackage.expiration === null &&
      customerPackage.remainingRedemptions >= 0
    ) {
      customerPackage.remainingRedemptions += 1; // Decrease remainingRedemptions by 1
      if (customerPackage.remainingRedemptions === package.redemptions) {
        customerPackage.status = "unused";
      }
    }

    // Step 4: Remove the punch history entry with the matching punchId and packageId
    customer.punchHistory = customer.punchHistory.filter(
      (punch) =>
        punch._id.toString() !== punchId ||
        punch.packageId.toString() !== packageId
    );

    // Step 5: Save the updated customer document
    const updatedCustomer = await customer.save();

    // Find the customer by ID and remove the punch history entry by punchId

    // Respond with the updated customer data
    res.status(200).json({
      status: "success",
      data: {
        package: updatedCustomer, // Return the updated package
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
