import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    category: { type: String, default: "post" },
    file: String,
    description: String,
    likes: {
      type: [Object],
      default: [],
    },
    visibility: { type: String, default: "public" },
    creator: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
