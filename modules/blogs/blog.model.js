const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const blogSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is missing"] },
    slug: { type: String, required: true, unique: true },
    tags: [String],
    image: { type: String },
    content: { type: String },
    author: { type: ObjectId, ref: "User", required: true },
    words: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "draft"], default: "draft" },
  },
  { timestamps: true }
);

module.exports = new model("Blog", blogSchema);
