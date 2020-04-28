const { Router } = require("express");
const fileUpload = require("express-fileupload");
const fac = require("./forge.client");
const jwt = require("jsonwebtoken");
const config = require("config");

const router = Router();
router.use(fileUpload());

function getUserId(req) {
  const [bearer, token] = req.headers.authorization.split(" "); // Getting client jwt token
  const { userId, iat, exp } = jwt.verify(token, config.get("jwtSecret")); // Verify teken. userId extraction
  return userId;
}

// /api/forge/oss/getApplicationName
router.get("/oss/getapplicationName", (req, res) => {
  fac.getApplicationName().then(
    (response) => res.status(200).json(response.data),
    (reject) => res.status(404).json(reject)
  );
});

// /api/forge/oss/getbuckets
router.get("/oss/getbuckets", (req, res) => {
  fac.getBuckets().then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/oss/file/upload
router.post("/oss/file/upload", (req, res) => {
  var files = req.files.files;
  const bucketKey = getUserId(req);
  fac.uploadFile(bucketKey, files).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/oss/getbucketdetails
router.post("/oss/getbucketdetails", (req, res) => {
  const { bucketKey } = req.body;
  fac.getBucketDetails(bucketKey).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/oss/deletebucket
router.post("/oss/deletebucket", (req, res) => {
  const { bucketKey } = req.body;
  fac.deleteBucket(bucketKey).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/oss/getobjects
router.get("/oss/getobjects", (req, res) => {
  const bucketKey = getUserId(req);
  fac.getObjects(bucketKey).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/oss/deleteobject
router.post("/oss/deleteobject", (req, res) => {
  const bucketKey = getUserId(req);
  const { objectName } = req.body;
  fac.deleteObject(bucketKey, objectName).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

module.exports = router;
