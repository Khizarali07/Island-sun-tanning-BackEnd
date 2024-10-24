const Bed = require("../Modals/Bed");

exports.getBeds = async (req, res, next) => {
  const beds = await Bed.aggregate([
    {
      $lookup: {
        from: "packages", // Collection name for the "Package" model
        localField: "packages", // The array field in the Bed model (contains ObjectId references)
        foreignField: "_id", // The field in the Package model
        as: "packagesInfo", // Alias for the joined data
      },
    },
    {
      $project: {
        id: "$_id", // Include the bed's id
        Name: "$name", // Include the bed's name
        packages: {
          $map: {
            input: "$packagesInfo", // The array of packages joined from the lookup
            as: "package", // Alias for each package in the array
            in: {
              id: "$$package._id", // Include the package id
              name: "$$package.name", // Include the package name
            },
          },
        },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { beds },
  });
  next();
};

exports.createBed = async (req, res, next) => {
  const currentBed = await Bed.create(req.body.newBed);

  console.log("successfully created");

  res.status(200).json({
    status: "success",
    data: { currentBed },
  });
  next();
};

exports.getAllBeds = async (req, res, next) => {
  const bed = await Bed.find();

  res.status(200).json({
    status: "success",
    data: bed,
  });
  next();
};

exports.deleteBed = async (req, res, next) => {
  const bed = await Bed.deleteOne({ _id: req.params.id });

  res.status(200).json({
    status: "success",
    data: null,
  });
  next();
};

exports.updateBed = async (req, res, next) => {
  const updatedBed = await Bed.findByIdAndUpdate(
    req.params.id, // Filter by bed ID from the URL
    { name: req.body.name, packages: req.body.packages } // Use the updated name and packages
  );

  // Check if the bed was updated successfully
  if (!updatedBed) {
    return res.status(404).json({
      status: "fail",
      message: "No bed found with that ID",
    });
  }

  // Send the response with the updated bed details
  res.status(200).json({
    status: "success",
    data: {
      bed: updatedBed,
    },
  });

  next();
};

exports.getBedsfromPackageID = async (req, res, next) => {
  try {
    const packageID = req.params.packageID; // Get packageID from the route params

    // Find all beds where the packageID exists in the 'packages' array
    const beds = await Bed.find({ packages: packageID });

    // Check if any beds were found
    if (beds.length > 0) {
      const filteredBeds = beds.map((bed) => {
        return {
          ...bed.toObject(), // Convert Mongoose Document to plain object
          packages: bed.packages.filter((pkg) => pkg.toString() === packageID), // Keep only the matching packageID
        };
      });

      res.status(200).json({
        status: "success",
        data: filteredBeds,
      });
    } else {
      return res
        .status(404)
        .json({ message: "No beds found for the given package ID" });
    }
    next();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
