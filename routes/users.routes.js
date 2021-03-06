const { Router } = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const chalk = require("chalk");
const { verifyAdmin, verifyRoot, verifyToken } = require("./middlewares");

const router = Router();

function getUserId(req) {
  const [bearer, token] = req.headers.authorization.split(" "); // Getting client jwt token
  const { userId, iat, exp } = jwt.verify(token, config.get("jwtSecret")); // Verify teken. userId extraction
  return userId;
}

// /api/users/profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    var dateNow = new Date();
    const userId = getUserId(req);
    const user = await User.findOne({ _id: userId }); // Get user by userId from database
    user.last_activity_at = `${dateNow}`;
    await user.save();
    console.log(chalk.greenBright("**** User authorized: ", user.email, "\n", dateNow));
    return res.status(200).json({ user }); // Send the user to the client
  } catch (e) {
    res.status(500).json({ message: "Something wrong, try again" });
  }
});

// /api/users/users
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}); // Getting all user from database
    return res.status(200).json({ users }); // Send the user to the client
  } catch (e) {
    res.status(500).json({ message: "Something wrong, try again" });
  }
});

// /api/users/role
router.post("/role", verifyRoot, async (req, res) => {
  try {
    console.log(req.body);
    const userId = req.body.userId;
    const role = req.body.role;
    const user = await User.findOne({ _id: userId });
    user.role = role;
    await user.save();
    return res.status(200).json({ message: `User ${userId} role has been changed on ${role}` });
  } catch (e) {
    res.status(500).json({ message: "Something wrong, try again" });
  }
});

// /api/users/delete
router.post("/delete", verifyAdmin, async (req, res) => {
  try {
    const userId = req.body.userId;
    const response = await User.findByIdAndDelete({ _id: userId });
    return res.status(200).json({ message: `User ${userId} was deleted` });
  } catch (e) {
    res.status(500).json({ message: "Something wrong, try again" });
  }
});

module.exports = router;
