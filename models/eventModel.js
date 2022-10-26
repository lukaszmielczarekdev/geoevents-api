import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
  title: String,
  date: String,
  duration: String,
  type: String,
  location: String,
  coordinates: { lng: Number, lat: Number },
  description: String,
  logo: String,
  guests: [Object],
  organizers: [Object],
  creator: String,
});

export default mongoose.model("Event", eventSchema);
