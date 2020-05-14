const ForgeSDK = require("forge-apis");
const axios = require("axios");
const { oAuth2TwoLegged } = require("./forge.auth");
const { forgeDesignAutomationApiClient } = require("./forge.auth");

function defaultHandleError(err) {
  console.error("\x1b[31m Error:", err, "\x1b[0m");
}

const bucketsApi = new ForgeSDK.BucketsApi(); // Buckets Client
const objectsApi = new ForgeSDK.ObjectsApi(); // Objects Client

function getApplicationName() {
  console.log("**** Getting application nickname");
  return axios.get("https://developer.api.autodesk.com/da/us-east/v3/forgeapps/me", {
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
  return new Promise((resolve, reject) => {
    Array.isArray(files) ? (files = files) : (files = [files]);
    console.log("**** Uploading files count: ", files.length);
    const signedResourcesData = [];
    let itemsProcessed = 0;
    files.forEach((file) => {
      const signedResourcesFile = { fileName: file.name, rvtFile: "", result: "" };
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
        .then(() => {
          console.log(">>>> Upploaded success \n", file.name, file.size);
          objectsApi
            .createSignedResource(
              bucketKey,
              file.name,
              {
                minutesExpiration: 10,
                singleUse: false,
              },
              { access: "read" },
              oAuth2TwoLegged,
              oAuth2TwoLegged.getCredentials()
            )
            .then((res) => {
              signedResourcesFile.rvtFile = res.body.signedUrl;
              objectsApi
                .createSignedResource(
                  bucketKey,
                  file.name.split(".").slice(0, -1).join(".") + "_extractedParameters.json",
                  {
                    minutesExpiration: 10,
                    singleUse: false,
                  },
                  { access: "readwrite" },
                  oAuth2TwoLegged,
                  oAuth2TwoLegged.getCredentials()
                )
                .then((res) => {
                  signedResourcesFile.result = res.body.signedUrl;
                  const workItem = {
                    activityId: "clforgeapp.ExtractRvtParamActivity+test",
                    arguments: {
                      rvtFile: {
                        url: signedResourcesFile.rvtFile,
                      },
                      result: {
                        verb: "put",
                        url: signedResourcesFile.result,
                      },
                    },
                  };
                  forgeDesignAutomationApiClient.createWorkItem(workItem).then(
                    (res) => {
                      var queryLoop = setInterval(() => {
                        forgeDesignAutomationApiClient.getWorkitemStatus(res.id).then(
                          (res) => {
                            if (res.status != "inprogress") {
                              signedResourcesData.push(signedResourcesFile);
                              itemsProcessed = itemsProcessed + 1;
                              if (itemsProcessed === files.length) {
                                res.signedResourcesData = signedResourcesData;
                                res.statusCode = 200;
                                console.log("Signed resources >>>>", res.signedResourcesData);
                                resolve(res);
                              }
                              clearInterval(queryLoop);
                            }
                          },
                          (err) => {
                            reject(err);
                            console.log(err);
                          }
                        );
                      }, 3000);
                    },
                    (err) => {
                      reject(err);
                      console.log(err);
                    }
                  );
                });
            });
        });
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
