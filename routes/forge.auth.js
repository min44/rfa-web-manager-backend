const ForgeSDK = require("forge-apis");
let AutodeskForgeDesignAutomation = require("autodesk.forge.designautomation");

const FORGE_CLIENT_ID = process.env.FORGE_CLIENT_ID;
const FORGE_CLIENT_SECRET = process.env.FORGE_CLIENT_SECRET;

const oAuth2TwoLegged = new ForgeSDK.AuthClientTwoLegged(
  FORGE_CLIENT_ID,
  FORGE_CLIENT_SECRET,
  ["data:write", "data:read", "bucket:read", "bucket:update", "bucket:create", "bucket:delete", "code:all"],
  false
);

// DesignAutomation client init
const apiClientDefault = AutodeskForgeDesignAutomation.AutodeskForgeDesignAutomationClient.instance;
const forgeDesignAutomationApiClient = new AutodeskForgeDesignAutomation.AutodeskForgeDesignAutomationApi();
const oauth = apiClientDefault.authManager.authentications["2-legged"];

// Common authorization
const authorizationCommon = () => {
  oAuth2TwoLegged.authenticate().then(() => {
    if (oAuth2TwoLegged.isAuthorized()) {
      console.log("Data Management is Authorized");
      // DesignAutomation api client autorization
      oauth.accessToken = oAuth2TwoLegged.getCredentials().access_token;
      if (oauth.oauth2Token.accessToken) {
        console.log("Design Automation is Authorized");
      }
    }
  });
};

// autorefresh authorization
setInterval(() => {
  authorizationCommon();
}, 60 * 1000 * 55 + 10 * 1000);

authorizationCommon();

module.exports.oAuth2TwoLegged = oAuth2TwoLegged;
module.exports.forgeDesignAutomationApiClient = forgeDesignAutomationApiClient;
