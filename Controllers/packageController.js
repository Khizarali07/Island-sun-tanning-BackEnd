const Package = require("../Modals/Package");

exports.createPackage = async (req, res, next) => {
  const currentPackage = await Package.create(req.body.newPackage);

  res.status(200).json({
    status: "success",
    data: { currentPackage },
  });
  next();
};

exports.getPackages = async (req, res, next) => {
  const Packages = await Package.find();

  res.status(200).json({
    status: "success",
    data: { Packages },
  });
  next();
};

exports.deletePackage = async (req, res, next) => {
  const Packages = await Package.deleteOne({ _id: req.params.id });

  res.status(200).json({
    status: "success",
    data: null,
  });
  next();
};

exports.updatePackage = async (req, res, next) => {
  console.log(req.body);

  const updatedPackage = await Package.findByIdAndUpdate(
    req.params.id, // Filter by ID
    req.body // Update data from the request body
  );

  if (!updatedPackage) {
    return res.status(404).json({
      status: "fail",
      message: "No package found with that ID",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      package: updatedPackage, // Return the updated package
    },
  });
  next();
};
