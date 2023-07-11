const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Set password for user"],
  },
  role: {
    type: String,
    required: true,
    enum: ["administrator", "boss", "regular"],
    default: "regular",
  },
  token: String,
  bossId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    validate: {
      validator: function (value) {
        if (this.role !== "administrator" && !value) {
          return false;
        }
        return true;
      },
      message: "Each user except the Administrator must have a boss.",
    },
  },
});

module.exports = mongoose.model("User", User);
