const { Router } = require("express");
const { forgeDesignAutomationApiClient } = require("./forge.auth");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const router = Router();

// /api/forge/da/createnickname
router.post("/da/createnickname", (req, res) => {
  console.log("__from createNickname");
  const { newname } = req.body;
  let nicknameRecord = { nickname: newname };
  forgeDesignAutomationApiClient.createNickname("me", nicknameRecord).then(
    (response) => {
      res.status(200).json(response.data);
      console.log(response);
    },
    (reject) => {
      res.status(404).json(reject.response.body);
      console.log(">>> reject >>> \n\n\n", reject);
    }
  );
});

// /api/forge/da/getappbundles
router.get("/da/getappbundles", (req, res) => {
  console.log("__from getAppBundles");
  forgeDesignAutomationApiClient.getAppBundles().then(
    (response) => {
      res.status(200).json(response.data);
      console.log(response);
    },
    (reject) => {
      res.status(404).json(reject);
      console.log(">>> reject >>> \n\n\n", reject);
    }
  );
});

// /api/forge/da/createappbundle
router.post("/da/createappbundle", (req, res) => {
  console.log("__from createAppBundle");
  const { id } = req.body;
  const appBundle = {
    id,
    engine: "Autodesk.Revit+2019",
    description: "Some UpdateParam Revit 2019",
  };
  forgeDesignAutomationApiClient.createAppBundle(appBundle).then(
    (response) => {
      res.status(202).end();
      console.log(">>> response >>> \n\n\n", response);
      let formData = new FormData();
      Object.keys(response.uploadParameters.formData).forEach((key) => {
        formData.append(key, response.uploadParameters.formData[key]);
      });
      const filePath = path.join(__dirname , "forge.appbundles", "ExtractRvtParam.zip");
      formData.append("file", fs.createReadStream(filePath), { knownLength: fs.statSync(filePath).size });
      const headers = {
        ...formData.getHeaders(),
        "Content-Length": formData.getLengthSync(),
      };
      axios.post(response.uploadParameters.endpointURL, formData, { headers }).then(
        (response) => {
          res.status(202).end();
          console.log(">>> response >>> \n\n\n", response);
          const alias = {
            version: 1,
            id: "test",
          };
          forgeDesignAutomationApiClient.createAppBundleAlias(appBundle.id, alias).then(
            (response) => {
              res.status(202).end();
              console.log(">>> response >>> \n\n\n API called successfully");
            },
            (reject) => {
              res.status(404).json(reject);
              console.log(">>> reject >>> \n\n\n", reject);
            }
          );
        },
        (reject) => {
          res.status(404).json(reject);
          console.log(">>> reject >>> \n\n\n", reject);
        }
      );
    },
    (reject) => {
      res.status(404).json(reject);
      console.log(">>> reject >>> \n\n\n", reject);
    }
  );
});

// /api/forge/da/deleteappbundle
router.post("/da/deleteAppBundle", (req, res) => {
  console.log("__from deleteAppBundle");
  const { id } = req.body;
  forgeDesignAutomationApiClient.deleteAppBundle(id).then(
    (response) => res.status(200).json(response),
    (reject) => res.status(404).json(reject)
  );
});

// /api/forge/da/createactivity
router.post("/da/createactivity", (req, res) => {
  console.log("__from createActivity");
  const { id } = req.body;

  const activity = {
    id: id,
    commandLine: [
      "$(engine.path)\\\\revitcoreconsole.exe /i $(args[rvtFile].path) /al $(appbundles[ExtractRvtParamAppBundle].path)",
    ],
    parameters: {
      rvtFile: {
        zip: false,
        ondemand: false,
        verb: "get",
        description: "Input Revit model",
        required: true,
        localName: "$(rvtFile)",
      },
      // inputJson: {
      //   verb: "get",
      //   description: "",
      //   localName: "params.json",
      //   zip: false,
      //   ondemand: false,
      // },
      result: {
        verb: "put",
        description: "",
        localName: "extractedParameters_parameters.json",
        zip: false,
        ondemand: false,
      },
      // result: {
      //   zip: false,
      //   ondemand: false,
      //   verb: "put",
      //   description: "Results",
      //   required: true,
      //   localName: "result.rvt",
      // },
    },
    engine: "Autodesk.Revit+2019",
    appbundles: ["clforgeapp.ExtractRvtParamAppBundle+test"],
    description: "Deletes walls from Revit file.",
  };

  forgeDesignAutomationApiClient.createActivity(activity).then(
    (response) => {
      res.status(202).end();
      console.log(">>> response >>> \n\n\n", response);
      const alias = {
        version: 1,
        id: "test",
      };
      forgeDesignAutomationApiClient.createActivityAlias(activity.id, alias).then(
        (response) => {
          res.status(202).end();
          console.log(">>> response >>> \n\n\n API called successfully");
        },
        (reject) => {
          res.status(404).json(reject);
          console.log(">>> reject >>> \n\n\n", reject);
        }
      );
    },
    (reject) => {
      res.status(404).json(reject);
      console.log(">>> reject >>> \n\n\n", reject);
      console.log(">>> activity >>> \n\n\n", activity);
    }
  );
});

// /api/forge/da/getactivities
router.get("/da/getactivities", (req, res) => {
  console.log("__from getActivities");
  forgeDesignAutomationApiClient.getActivities().then(
    (response) => {
      res.status(200).json(response.data);
      console.log(response);
    },
    (reject) => {
      res.status(404).json(reject);
      console.log(">>> reject >>> \n\n\n", reject);
    }
  );
});

// /api/forge/da/deleteactivity
router.post("/da/deleteactivity", (req, res) => {
  console.log("__from deleteActivity");
  const { id } = req.body;
  forgeDesignAutomationApiClient.deleteActivity(id).then(
    (response) => res.status(200).json(response),
    (reject) => res.status(404).json(reject)
  );
});

// /api/forge/da/createworkitem
router.post("/da/createworkitem", (req, res) => {
  console.log("__from createWorkItem");
  const { id } = req.body;

  const workItem = {
    activityId: "clforgeapp.ExtractRvtParamActivity+test",
    arguments: {
      rvtFile: {
        url: rvtFileUrl,
      },
      inputJson: {
        url: "data:application/json,{height:12, width:12}",
      },
      outputJson: {
        verb: "put",
        url: outputJsonUrl,
      },
      result: {
        verb: "put",
        url: resultUrl,
      },
    },
  };

  forgeDesignAutomationApiClient.createWorkItem(workItem, id).then(
    (response) => {
      res.status(202).end();
      console.log(">>> response >>> \n\n\n", response);
      setInterval(() => {
        forgeDesignAutomationApiClient.getWorkitemStatus(response.id).then(
          (response) => {
            console.log("API called successfully. Returned data: \n", response, "\n");
          },
          (error) => {
            console.error(error);
          }
        );
      }, 4000);
    },
    (reject) => {
      res.status(404).json(reject);
      console.log(">>> reject >>> \n\n\n", reject);
    }
  );
});

module.exports = router;
