const axios = require('axios');
const AUTH_TOKEN = process.env.SUDOFY_SSS_API_TOKEN
const JIRA_PROJECT = process.env.JIRA_PROJECT;
const JIRA_VERSION_SUFFIX = process.env.JIRA_VERSION_SUFFIX;
const JIRA_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT;
const JIRA_VERSION = process.env.SENTRY_RELEASE;
const sudofySSSEndpoint = axios.create({
  baseURL: 'https://sss-api.sudofy.com/',
  timeout: 10000
});

exports.getVersionNumber = (branch) => new Promise(async (resolve, reject) => {
  try {
    let response;
    if (branch.includes('-hotfix')) {
      response = await sudofySSSEndpoint.get(`jira/release-hotfix-version?token=${AUTH_TOKEN}&project=${JIRA_PROJECT}&suffix=${JIRA_VERSION_SUFFIX}`);
    } else {
      response = await sudofySSSEndpoint.get(`jira/current-release-version?token=${AUTH_TOKEN}&project=${JIRA_PROJECT}&suffix=${JIRA_VERSION_SUFFIX}`);
    }
    resolve(response.data.data);
  } catch (e) {
    console.log(e);
    reject(e);
  }
});

exports.releaseVersion = (branch) => new Promise(async (resolve, reject) => {
  try {
    let response;
    if (branch.includes('-hotfix')) {
      response = await sudofySSSEndpoint.get(`jira/release-hotfix-version?token=${AUTH_TOKEN}&project=${JIRA_PROJECT}&suffix=${JIRA_VERSION_SUFFIX}&createAndDeploy=true`);
    } else {
      response = await sudofySSSEndpoint.get(`jira/release-version?token=${AUTH_TOKEN}&project=${JIRA_PROJECT}&suffix=${JIRA_VERSION_SUFFIX}&environment=${JIRA_ENVIRONMENT}&version=${JIRA_VERSION}`);
    }
    resolve(response.data.data);
  } catch (e) {
    console.log(e);
    reject(e);
  }
});
