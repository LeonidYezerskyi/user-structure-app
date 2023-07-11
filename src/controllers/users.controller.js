const User = require("../models/user.model");
const { hashPassword } = require("../utils/hash.util");
const { jwtSign } = require("../utils/jwt.util");

const signUp = async (req, res) => {
  try {
    const { name, email, password, role, bossName } = req.body;

    const user = await User.findOne({
      email,
    });

    if (user) {
      return res.status(409).send({
        message: "Email in use",
      });
    }

    const adminExists = await User.exists({ role: "administrator" });
    if (role === "administrator" && adminExists) {
      return res.status(400).json({
        message:
          "Administrator user already exists. Only one user can be administrator",
      });
    }

    let bossId = null;

    if (role !== "administrator" && bossName) {
      const boss = await User.findOne({ name: bossName });
      if (!boss) {
        return res
          .status(400)
          .json({ message: "Invalid bossName. Boss does not exist." });
      }
      bossId = boss._id;
    }

    const newUser = await User.create({
      name,
      email,
      password: hashPassword(password),
      role,
      bossId,
    });

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: newUser._id,
      },
      {
        token: jwtSign({ _id: newUser._id }),
      },
      {
        new: true,
      }
    ).select("-password");

    res.status(201).send({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  signUp,
};
