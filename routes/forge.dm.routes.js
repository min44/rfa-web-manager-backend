const { Router } = require("express");
const fileUpload = require("express-fileupload");

const config = require("config");
const forgeDataManagementApiClient = require("./forge.dm.apiclient");
const { getUserId, verifyToken, verifyAdmin } = require("./middlewares");

const router = Router();
router.use(fileUpload());

// /api/forge/dm/getApplicationName
router.get("/dm/getapplicationName", verifyToken, (req, res) => {
  forgeDataManagementApiClient.getApplicationName().then(
    (response) => res.status(200).json(response.data),
    (reject) => res.status(404).json(reject)
  );
});

// /api/forge/dm/getbuckets
router.get("/dm/getbuckets", verifyAdmin, (req, res) => {
  forgeDataManagementApiClient.getBuckets().then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/file/upload
router.post("/dm/file/upload", verifyToken, (req, res) => {
  var files = req.files.files;
  const bucketKey = getUserId(req);
  forgeDataManagementApiClient.uploadFile(bucketKey, files).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/getbucketdetails
router.post("/dm/getbucketdetails", verifyToken, (req, res) => {
  const { bucketKey } = req.body;
  forgeDataManagementApiClient.getBucketDetails(bucketKey).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/deletebucket
router.post("/dm/deletebucket", verifyAdmin, (req, res) => {
  const { bucketKey } = req.body;
  forgeDataManagementApiClient.deleteBucket(bucketKey).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/getobjects
router.get("/dm/getobjects", verifyToken, (req, res) => {
  const bucketKey = getUserId(req);
  forgeDataManagementApiClient.getObjects(bucketKey).then(
    (response) => res.status(response.statusCode).json(response),
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/getallobjects
router.get("/dm/getallobjects", verifyAdmin, (req, res) => {
  forgeDataManagementApiClient.getAllObjects().then(
    (response) => res.status(200).json(response),
    (reject) => res.status(404).json(reject)
  );
});

// /api/forge/dm/getextractedparametersfiles
router.get("/dm/getextractedparametersfiles", verifyToken, (req, res) => {
  const bucketKey = getUserId(req);
  forgeDataManagementApiClient.getExtractedParametersFiles(bucketKey).then(
    (response) => {
      res.status(response.statusCode).json(response);
    },
    (reject) => res.status(reject.statusCode).json(reject)
  );
});

// /api/forge/dm/deleteobject
router.post("/dm/deleteobject", verifyToken, (req, res) => {
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
