module.exports = {
  mongoUrl: process.env.MONGODB_URI,
  'aws': {
    'accessKeyId': process.env.AWS_ACCESS_KEY_ID,
    'secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY,
    'region': 'eu-west-1'
  },
  cognitoPoolArn: 'arn:aws:cognito-idp:eu-west-1:864671417420:userpool/eu-west-1_6pL9ipBvb',
  cognitoPoolId: 'eu-west-1_6pL9ipBvb',
  cognitoClientId: '6qqfjqeemgtkeol95v1d5bh761',
  notificationSNSArn: 'arn:aws:sns:eu-west-1:864671417420:send-notification-prod',
  customDomainName: 'api-prod.cloud.scannget.com',
  basePath: 'api',
  roleArn: 'arn:aws:iam::864671417420:role/Cognito_scan_and_get_prodAuth_Role',
  identityPoolId: 'eu-west-1:d971a62d-04e1-452a-9fbd-a8c1af43dd09',
  loginUploadConfig: 'cognito-idp.eu-west-1.amazonaws.com/eu-west-1_6pL9ipBvb',
  assetsS3Bucket: 'sng-assets-prod',
  s3BucketCDN: 'https://assets-prod.cloud.scannget.com',
  clientPanelUrl: 'https://client.cloud.scannget.com',
  outlookId: process.env.OUTLOOK_ID,
  outlookPass: process.env.OUTLOOK_PASS,
  oneSignalApiKey: process.env.ONE_SIGNAL_API_KEY,
  oneSignalAppId: process.env.ONE_SIGNAL_APP_ID,
  IOTPublishEndpoint: process.env.AWS_IOT_ENDPOINT
};
