const User = require("../models/user.model");
const { hashPassword, comparePasswords } = require("../utils/hash.util");
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

    const usersCount = await User.countDocuments();
    if (usersCount === 0 && role !== "administrator") {
      return res.status(400).json({
        message: "The first registered user must be only an administrator",
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

const authenticateUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(401).send({
      message: "Email or password is wrong",
    });
  }

  const isPasswordValid = comparePasswords(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).send({
      message: "Email or password is wrong",
    });
  }

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
    },
    {
      token: jwtSign({ _id: user._id }),
    },
    {
      new: true,
    }
  ).select("-password");

  res.status(200).send({
    token: updatedUser.token,
    user: { email: user.email, role: user.role },
  });
};

const getUsers = async (req, res) => {
  const { role, userId } = req.body;

  try {
    if (role === "administrator") {
      const users = await User.find();
      return res.status(200).json({ users });
    } else if (role === "boss") {
      const boss = await User.findById(userId);

      if (boss.role !== "boss") {
        return res.status(403).json({
          message: "User is not authorized to perform this operation",
        });
      }

      const subordinates = await User.find({ bossId: userId });
      return res.status(200).json({ boss, subordinates });
    } else if (role === "regular") {
      const user = await User.findById(userId);

      if (user.role !== "regular") {
        return res.status(403).json({
          message: "User is not authorized to perform this operation",
        });
      }

      return res.status(200).json({ users: [user] });
    } else {
      return res.status(400).json({ message: "Invalid user role" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  signUp,
  authenticateUser,
  getUsers,
};
