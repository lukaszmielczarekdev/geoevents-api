import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import eventRouter from "./routers/event.js";

const app = express();

app.use(cors());
app.use("/events", eventRouter);

app.get("/", (req, res) => res.send("Geo Events API"));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.CONNECTION_URL)
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port : ${PORT}`))
  )
  .catch((error) => console.log(error.message));
