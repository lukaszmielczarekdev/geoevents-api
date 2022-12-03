import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true, min: 5, max: 40 },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, min: 5, max: 40 },
  lastLogged: {
    type: String,
    default: new Date().toLocaleDateString("en-GB"),
  },
  external: {
    type: Boolean,
    default: false,
  },
  newsletter: {
    type: Boolean,
    default: false,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  following: {
    type: [Object],
    default: [],
  },
  followers: {
    type: [Object],
    default: [],
  },
  timeline: {
    type: [Object],
    default: [],
  },
  createdAt: { type: Date, expires: "24h", default: Date.now },
});

export default mongoose.model("User", userSchema);
