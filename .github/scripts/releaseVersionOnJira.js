const { releaseVersion } = require('./sssApi');
const branch = process.env.DEPLOYMENT_CURRENT_BRANCH;
(async () => {
  try {
    const response = await releaseVersion(branch);
    console.log(response);
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
})();