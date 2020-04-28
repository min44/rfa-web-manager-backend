const ForgeSDK = require("forge-apis");
const apiClient = require("./apiClient");

function defaultHandleError(err) {
  console.error("\x1b[31m Error:", err, "\x1b[0m");
}

const FORGE_CLIENT_ID = process.env.FORGE_CLIENT_ID;
const FORGE_CLIENT_SECRET = process.env.FORGE_CLIENT_SECRET;
const bucketsApi = new ForgeSDK.BucketsApi(); // Buckets Client
const objectsApi = new ForgeSDK.ObjectsApi(); // Objects Client

const oAuth2TwoLegged = new ForgeSDK.AuthClientTwoLegged(
  FORGE_CLIENT_ID,
  FORGE_CLIENT_SECRET,
  ["data:write", "data:read", "bucket:read", "bucket:update", "bucket:create", "bucket:delete"],
  true
);

/**
 * Create an access token and run the API calls.
 */
oAuth2TwoLegged.authenticate().then(() => {
  console.log("**** Got Credentials");
  console.log("isAuthorized: ", oAuth2TwoLegged.isAuthorized());
});

function getApplicationName() {
  console.log("**** Getting application nickname");
  return apiClient.get("https://developer.api.autodesk.com/da/us-east/v3/forgeapps/me", {
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + oAuth2TwoLegged.getCredentials().access_token,
    },
  });
}

function getBuckets() {
  console.log("**** Getting all buckets");
  return bucketsApi.getBuckets({}, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials());
}

function getBucketDetails(bucketKey) {
  console.log("**** Getting bucket details: " + bucketKey);
  return bucketsApi.getBucketDetails(bucketKey, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials());
}

function deleteBucket(bucketKey) {
  console.log("**** Delete bucket: ", bucketKey);
  return bucketsApi.deleteBucket(bucketKey, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials());
}

function deleteObject(bucketKey, objectName) {
  console.log("**** Delete object: ", objectName);
  return objectsApi.deleteObject(bucketKey, objectName, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials());
}

function createBucket(bucketKey) {
  console.log("**** Creating Bucket: " + bucketKey);
  var createBucketJson = {
    bucketKey: bucketKey,
    policyKey: "temporary",
  };
  return bucketsApi.createBucket(createBucketJson, {}, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials());
}

function createBucketIfNotExist(bucketKey) {
  console.log("**** Creating bucket if not exist: ", bucketKey);
  return new Promise((resolve, reject) => {
    getBucketDetails(bucketKey).then(
      (resp) => resolve(resp),
      (err) => {
        if (err.statusCode === 404) {
          createBucket(bucketKey).then(
            (res) => resolve(res),
            (err) => reject(err)
          );
        } else reject(err);
      }
    );
  });
}

function uploadFile(bucketKey, files) {
  console.log("**** Uploading files: ");
  return new Promise((resolve, reject) => {
    Array.isArray(files) ? (files = files) : (files = [files]);
    files.forEach((file) => {
      objectsApi
        .uploadObject(
          bucketKey,
          file.name,
          file.size,
          file.data,
          {},
          oAuth2TwoLegged,
          oAuth2TwoLegged.getCredentials()
        )
        .then(
          (res) => resolve(res),
          (err) => reject(err)
        );
    });
  });
}

function getObjects(bucketKey) {
  console.log("**** Getting all objects: ", bucketKey);
  return objectsApi.getObjects(bucketKey, {}, oAuth2TwoLegged, oAuth2TwoLegged.getCredentials());
}

module.exports = {
  deleteObject,
  defaultHandleError,
  oAuth2TwoLegged,
  getApplicationName,
  getBuckets,
  getBucketDetails,
  deleteBucket,
  createBucket,
  createBucketIfNotExist,
  uploadFile,
  getObjects,
};
