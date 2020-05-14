const ForgeSDK = require("forge-apis");
let AutodeskForgeDesignAutomation = require("autodesk.forge.designautomation");

const FORGE_CLIENT_ID = process.env.FORGE_CLIENT_ID;
const FORGE_CLIENT_SECRET = process.env.FORGE_CLIENT_SECRET;

const oAuth2TwoLegged = new ForgeSDK.AuthClientTwoLegged(
  FORGE_CLIENT_ID,
  FORGE_CLIENT_SECRET,
  ["data:write", "data:read", "bucket:read", "bucket:update", "bucket:create", "bucket:delete", "code:all"],
  true
);

const apiClientDefault = AutodeskForgeDesignAutomation.AutodeskForgeDesignAutomationClient.instance;
const forgeDesignAutomationApiClient = new AutodeskForgeDesignAutomation.AutodeskForgeDesignAutomationApi();

// Data management Authorize
oAuth2TwoLegged.authenticate().then(() => {
  console.log("**** Got Credentials");
  console.log("Data Management isAuthorized: ", oAuth2TwoLegged.isAuthorized());

  // Design Automation Authorize
  const oauth = apiClientDefault.authManager.authentications["2-legged"];

  const forgeDesignAutomationAuth = () => {
    oauth.accessToken = oAuth2TwoLegged.getCredentials().access_token;
    if (oauth.oauth2Token.accessToken) {
      console.log("Design Automation isAuthorized: ");
    }
  };
  forgeDesignAutomationAuth();

  setInterval(() => {
    forgeDesignAutomationAuth();
  }, 3600000);
});

module.exports.oAuth2TwoLegged = oAuth2TwoLegged;
module.exports.forgeDesignAutomationApiClient = forgeDesignAutomationApiClient;
