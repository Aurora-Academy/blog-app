const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phone: Number,
    roles: {
      type: [String],
      enum: ["admin", "user"],
      default: "user",
      required: true,
    },
    token: String,
    profilePic: { type: String },
  },
  { timestamps: true }
);

module.exports = new model("User", userSchema);
