import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

import env_vars from "./config/config.js";
import postRoutes from "./routes/Posts.js";

const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/api/v1/posts", postRoutes);

app.get("/api/v1", (req, res) => {
  res.send("<h2>Hello Docker. Connected to MongoDB</h2>");
});

app.enable("trust proxy");

const PORT = process.env.PORT || 3000;
const CONNECTION_URL = `mongodb://${env_vars.MONGO_USER}:${env_vars.MONGO_PASSWORD}@${env_vars.MONGO_IP}:${env_vars.MONGO_PORT}/?authSource=admin`;

mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server Running. Connected to MongoDB`))
  )
  .catch((error) => console.log(`${error} did not connect`));
