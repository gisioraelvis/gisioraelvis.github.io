const githubService = require("../../shared/githubService");

module.exports = async function (context, req) {
  const code = req.body && req.body.code;
  if (!code) {
    context.res = {
      status: 400,
      body: "Code is required",
    };
    return;
  }

  try {
    const token = await githubService.getGithubToken(code);
    context.res = {
      status: 200,
      body: { token },
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: error.message,
    };
  }
};
