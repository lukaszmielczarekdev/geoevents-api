import * as dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import eventRouter from "./routers/event.js";
import userRoutes from "./routers/user.js";
import postRoutes from "./routers/post.js";

dotenv.config();

const app = express();

app.use(bodyParser.json({ limit: "15mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "15mb", extended: true }));
app.use(cors());
app.use("/events", eventRouter);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

app.get("/", (req, res) => res.send("Geo Events API"));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.CONNECTION_URL)
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port : ${PORT}`))
  )
  .catch((error) => console.log(error.message));
