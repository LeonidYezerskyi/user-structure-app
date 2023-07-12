const User = require("../models/user.model");
const { hashPassword, comparePasswords } = require("../utils/hash.util");
const { jwtSign, jwtVerify } = require("../utils/jwt.util");

const signUp = async (req, res) => {
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
        "Administrator user already exists. Only one user can be an administrator",
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

  if (role === "administrator") {
    const user = await User.findById(userId);

    if (user.role !== "administrator") {
      return res.status(403).json({
        message: "User is not authorized to perform this operation",
      });
    }

    const users = await User.find();
    return res.status(200).json({ users });
  } else if (role === "boss") {
    const user = await User.findById(userId);

    if (user.role !== "boss") {
      return res.status(403).json({
        message: "User is not authorized to perform this operation",
      });
    }

    const subordinates = await User.find({ bossId: userId });
    return res.status(200).json({ user, subordinates });
  } else if (role === "regular") {
    const user = await User.findById(userId);

    if (user.role !== "regular") {
      return res.status(403).json({
        message: "User is not authorized to perform this operation",
      });
    }

    return res.status(200).json({ user });
  } else {
    return res.status(400).json({ message: "Invalid user role" });
  }
};

const isAuthorized = async (req, res, next) => {
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).send({
        message: "Not authorized",
      });
    }

    const decoded = jwtVerify(token);

    const user = await User.findOne({
      _id: decoded._id,
    });

    if (!user.token || !user._id) {
      return res.status(401).send({
        message: "Not authorized",
      });
    }

    req.userId = decoded._id;

    next();
  } catch (err) {
    console.error(err);
    return res
      .status(403)
      .json({ message: "Your session has timed out. You need to log in" });
  }
};

const changeUserBoss = async (req, res) => {
  const userId = req.params.id;
  const { newBossId } = req.body;

  const user = await User.findById(userId);

  const boss = await User.findOne({
    _id: user.bossId,
  });

  if (!boss) {
    return res.status(403).json({
      message: "Access denied, only user's boss can change new boss for him",
    });
  }

  const loggedInUser = await User.findById(req.userId);

  if (loggedInUser.role !== "boss" && loggedInUser.role !== "administrator") {
    return res.status(403).json({
      message: "Access denied, only boss can change user's boss",
    });
  }

  if (boss._id.toString() !== loggedInUser._id.toString()) {
    return res.status(403).json({
      message: "Access denied, only user's boss can change new boss for him",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { bossId: newBossId },
    { new: true }
  );

  return res
    .status(200)
    .json({ message: "User's boss has been changed", user: updatedUser });
};

module.exports = {
  signUp,
  authenticateUser,
  getUsers,
  changeUserBoss,
  isAuthorized,
};
