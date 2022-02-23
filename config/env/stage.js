module.exports = {
  mongoUrl: process.env.MONGODB_URI,
  'aws': {
    'accessKeyId': process.env.AWS_ACCESS_KEY_ID,
    'secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY,
    'region': 'eu-west-1'
  },
  cognitoPoolArn: 'arn:aws:cognito-idp:eu-west-1:864671417420:userpool/eu-west-1_gclprCjNd',
  cognitoPoolId: 'eu-west-1_gclprCjNd',
  cognitoClientId: '30cmtm2975qhenu6smg9f4lqb6',
  notificationSNSArn: 'arn:aws:sns:eu-west-1:864671417420:send-notification-stage',
  customDomainName: 'api-stage.cloud.scannget.com',
  basePath: 'api',
  roleArn: 'arn:aws:iam::864671417420:role/Cognito_scan_and_get_stageAuth_Role',
  identityPoolId: 'eu-west-1:f9157c3f-886d-4f17-8c17-902229ef519e',
  loginUploadConfig: 'cognito-idp.eu-west-1.amazonaws.com/eu-west-1_gclprCjNd',
  assetsS3Bucket: 'sng-assets-stage',
  s3BucketCDN: 'https://assets-stage.cloud.scannget.com',
  clientPanelUrl: 'https://client-stage.cloud.scannget.com',
  outlookId: process.env.OUTLOOK_ID,
  outlookPass: process.env.OUTLOOK_PASS,
  oneSignalApiKey: process.env.ONE_SIGNAL_API_KEY,
  oneSignalAppId: process.env.ONE_SIGNAL_APP_ID,
  IOTPublishEndpoint: process.env.AWS_IOT_ENDPOINT
};
