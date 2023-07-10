const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  password: {
    type: String,
    required: [true, "Set password for user"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["administrator ", "boss", "regular"],
    default: "regular",
  },
  bossId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("User", User);
