import mongoose from "mongoose";

const businessSchema = mongoose.Schema(
  {
    name: { type: String, min: 5, max: 40 },
    openingtime: String,
    category: String,
    address: String,
    coordinates: { lng: Number, lat: Number },
    description: { type: String, min: 5, max: 800 },
    contact: { phone: String, email: String, website: String },
    type: {
      type: String,
      default: "business",
    },
    logo: String,
    creator: Object,
    owners: [Object],
    likes: {
      type: [Object],
      default: [],
    },
    rating: {
      rates: {
        type: [Object],
        default: [],
      },
      ratesNumber: {
        type: Number,
        default: 0,
      },
      average: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Business", businessSchema);
