const axios = require("axios");
const config = require("./config");

async function getGithubToken(code) {
  const response = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
    },
    {
      headers: {
        accept: "application/json",
      },
    }
  );

  if (response.data.error) {
    throw new Error(response.data.error_description);
  }

  return response.data.access_token;
}

module.exports = {
  getGithubToken,
};
