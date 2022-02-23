module.exports = {
  "release-test": {
    variables: [
      { key: "APPLICATION_ENVIRONMENT", value: `scannget-test` },
      { key: "SENTRY_ENVIRONMENT", value: `test` },
    ]
  },
  "release-stage": {
    variables: [
      { key: "APPLICATION_ENVIRONMENT", value: `scannget-stage` },
      { key: "SENTRY_ENVIRONMENT", value: `stage` },
    ]
  },
  "release-prod": {
    variables: [
      { key: "APPLICATION_ENVIRONMENT", value: `scannget-prod` },
      { key: "SENTRY_ENVIRONMENT", value: `prod` },
    ]
  },
  "release-prod-hotfix": {
    variables: [
      { key: "APPLICATION_ENVIRONMENT", value: `scannget-prod` },
      { key: "SENTRY_ENVIRONMENT", value: `prod` },
    ]
  }

}