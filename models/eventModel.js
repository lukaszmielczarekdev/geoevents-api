import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
  {
    title: { type: String, min: 5, max: 40 },
    start: String,
    end: String,
    category: String,
    location: String,
    coordinates: { lng: Number, lat: Number },
    description: { type: String, min: 5, max: 800 },
    type: {
      type: String,
      default: "event",
    },
    logo: String,
    creator: Object,
    admins: [Object],
    participants: [Object],
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
