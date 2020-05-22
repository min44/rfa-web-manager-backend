const { Router } = require("express");
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const config = require("config");
const forgeDataManagementApiClient = require("./forge.dm.apiclient");

const router = Router();
router.use(fileUpload());

function getUserId(req) {
  const [bearer, token] = req.headers.authorization.split(" "); // Getting client jwt token
  const { userId, iat, exp } = jwt.verify(token, config.get("jwtSecret")); // Verify teken. userId extraction
  return userId;
}

// /api/forge/dm/getApplicationName
router.get("/dm/getapplicationName", (req, res) => {
  forgeDataManagementApiClient.getApplicationName().then(
    (response) => res.status(200).json(response.data),
    (reject) => res.status(404).json(reject)
  );
});

// /api/forge/dm/getbuckets
router.get("/dm/getbuckets", (req, res) => {
  forgeDataManagementApiClient.getBuckets().then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/file/upload
router.post("/dm/file/upload", (req, res) => {
  var files = req.files.files;
  const bucketKey = getUserId(req);
  forgeDataManagementApiClient.uploadFile(bucketKey, files).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/getbucketdetails
router.post("/dm/getbucketdetails", (req, res) => {
  const { bucketKey } = req.body;
  forgeDataManagementApiClient.getBucketDetails(bucketKey).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/deletebucket
router.post("/dm/deletebucket", (req, res) => {
  const { bucketKey } = req.body;
  forgeDataManagementApiClient.deleteBucket(bucketKey).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/getobjects
router.get("/dm/getobjects", (req, res) => {
  const bucketKey = getUserId(req);
  forgeDataManagementApiClient.getObjects(bucketKey).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/getallobjects
router.get("/dm/getallobjects", (req, res) => {
  forgeDataManagementApiClient.getAllObjects().then(
    (response) => res.status(200).json(response),
    (reject) => res.status(404).json(reject)
  );
});

// /api/forge/dm/getextractedparametersfiles
router.get("/dm/getextractedparametersfiles", (req, res) => {
  const bucketKey = getUserId(req);
  forgeDataManagementApiClient.getExtractedParametersFiles(bucketKey).then(
    (response) => {
      res.status(response.statusCode).json(response);
    },
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/deleteobject
router.post("/dm/deleteobject", (req, res) => {
  let { bucketKey, objectKey } = req.body;
  if (!bucketKey) {
    bucketKey = getUserId(req);
  }
  forgeDataManagementApiClient.deleteObject(bucketKey, objectKey).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

module.exports = router;
