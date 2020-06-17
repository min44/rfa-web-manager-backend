const { Router } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const forgeDataManagementApiClient = require("./forge.dm.apiclient");
const chalk = require("chalk");
const { getUserId } = require("./middlewares");

const router = Router();

// /api/auth/register
router.post(
  "/register",
  [
    check("email", "Please enter a valid email").normalizeEmail().isEmail(),
    check("password", "Please enter password").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          message: "Input data validation error",
          errors: errors.array(),
        });
      }
      // Get data from user
      const { email, password, full_name, display_name } = req.body;
      // Search candidate in database
      const candidate = await User.findOne({ email });
      if (candidate) {
        // If not finded send error
        return res.status(422).json({
          message: "User already exist",
          errors: [{ msg: "User already exist", param: "email" }],
        });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      var dateNow = new Date();
      const user = new User({
        email,
        password: hashedPassword,
        display_name,
        full_name,
        created_at: `${dateNow}`,
        last_activity_at: `${dateNow}`,
        language: "ENU",
        role: "user",
      });
      await user.save();
      const token = jwt.sign({ userId: user.id }, config.get("jwtSecret"), {
        expiresIn: "12h",
      });
      console.log(chalk.greenBright("**** New user created: ", email, "\n", dateNow));
      forgeDataManagementApiClient.createBucketIfNotExist(user.id).then((createBucketRes) => {
        console.log(`**** Create bucket if not exist when user register: \n`, createBucketRes.body);
        return res.status(201).json({ token, user });
      }, forgeDataManagementApiClient.defaultHandleError);
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong, try again",
        errors: "Something went wrong, try again",
      });
    }
  }
);

// /api/auth/login
router.post(
  "/login",
  [
    check("email", "Please enter a valid email").normalizeEmail().isEmail(),
    check("password", "Please enter password").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          errors: errors.array(),
        });
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(422).json({
          errors: [{ msg: "User not found", param: "email" }],
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(422).json({
          errors: [{ msg: "Incorrect password", param: "password" }],
        });
      }
      const token = jwt.sign({ userId: user.id }, config.get("jwtSecret"), {
        expiresIn: "12h",
      });
      var dateNow = new Date();
      user.last_activity_at = `${dateNow}`;
      await user.save();
      console.log(chalk.greenBright("**** User is login: ", user.email, "\n", dateNow));
      return res.status(201).json({ token, user });
    } catch (e) {
      return res.status(500).json({
        message: "Something wrong, try again",
        errors: "Something wrong",
      });
    }
  }
);

// /api/auth/logout
router.post("/logout", async (req, res) => {
  try {
    var dateNow = new Date();
    const userId = getUserId(req);
    const user = await User.findOne({ _id: userId }); // Get user by userId from database
    user.last_activity_at = `${dateNow}`;
    await user.save();
    console.log(chalk.greenBright("**** User is logout: ", user.email, "\n", dateNow));
    return res.status(201).json({ message: "is logout" });
  } catch (e) {
    return res.status(500).json({ message: "Something wrong, try again" });
  }
});

module.exports = router;
