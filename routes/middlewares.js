const jwt = require("jsonwebtoken");
const config = require("config");

const admins = ["5ee9865259c4b46d987a63d7", "5ee9badfd8e0498bd47ce1b5"];
const roots = ["5ee9865259c4b46d987a63d7"];

function getUserId(req) {
  const [bearer, token] = req.headers.authorization.split(" "); // Getting client jwt token
  const { userId, iat, exp } = jwt.verify(token, config.get("jwtSecret")); // Verify teken. userId extraction
  return userId;
}

function verifyToken(req, res, next) {
  const userId = getUserId(req);
  if (userId) {
    next();
  } else {
    res.sendStatus(403);
  }
}

function verifyAdmin(req, res, next) {
  const userId = getUserId(req);
  if (admins.includes(userId)) {
    next();
  } else {
    res.sendStatus(403);
  }
}

function verifyRoot(req, res, next) {
  const userId = getUserId(req);
  if (roots.includes(userId)) {
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = { getUserId, verifyToken, verifyAdmin, verifyRoot };
