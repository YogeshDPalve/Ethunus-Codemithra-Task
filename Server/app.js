require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const apiRoutes = require("./api/routes/transcationDetails.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); 
  }
};

app.use("/api", apiRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

module.exports = app; 
