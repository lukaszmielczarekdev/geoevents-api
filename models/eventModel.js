import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
  title: String,
  start: String,
  end: String,
  category: String,
  location: String,
  coordinates: { lng: Number, lat: Number },
  description: String,
  logo: String,
  creator: String,
});

export default mongoose.model("Event", eventSchema);
