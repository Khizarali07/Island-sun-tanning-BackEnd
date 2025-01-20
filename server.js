const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const adminRouter = require("./Routes/adminRoute.js");
const customerRouter = require("./Routes/customerRoute.js");
const packageRouter = require("./Routes/packageRoute.js");
const bedRouter = require("./Routes/bedRoute.js");

dotenv.config({ path: "./config.env" });

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.error("DB connection error:", err.message);
    process.exit(1); // Exit on database connection error
  });

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use("/api/v1", adminRouter);
app.use("/api/v1", customerRouter);
app.use("/api/v1", packageRouter);
app.use("/api/v1", bedRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
