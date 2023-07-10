const User = require("../models/user.model");
const { hashPassword } = require("../utils/hash.util");
const { jwtSign } = require("../utils/jwt.util");

const signUp = async (req, res) => {
  try {
    const { name, email, password, role, bossName } = req.body;
    console.log(name, email, password, role, bossName);
    const user = await User.findOne({
      email,
    });

    if (user) {
      return res.status(409).send({
        message: "Email in use",
      });
    }

    let bossId = null;

    if (role !== "administrator" && bossName) {
      const boss = await User.findOne({ name: bossName, role: "boss" });
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
      bossName,
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
