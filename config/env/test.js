module.exports = {
  mongoUrl: process.env.MONGODB_URI,
  'aws': {
    'accessKeyId': process.env.AWS_ACCESS_KEY_ID,
    'secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY,
    'region': 'eu-west-1'
  },
  cognitoPoolArn: 'arn:aws:cognito-idp:eu-west-1:864671417420:userpool/eu-west-1_HpLu7qrwS',
  cognitoPoolId: 'eu-west-1_HpLu7qrwS',
  cognitoClientId: '1r0oblsvt8dho4bra49a7kpjbq',
  notificationSNSArn: 'arn:aws:sns:eu-west-1:864671417420:send-notification-test',
  customDomainName: 'api-test.cloud.scannget.com',
  basePath: 'api',
  roleArn: 'arn:aws:iam::864671417420:role/Cognito_scan_and_get_testAuth_Role',
  identityPoolId: 'eu-west-1:8cbf431d-1f68-4034-870a-bfac7db402be',
  loginUploadConfig: 'cognito-idp.eu-west-1.amazonaws.com/eu-west-1_HpLu7qrwS',
  assetsS3Bucket: 'sng-assets-test',
  s3BucketCDN: 'https://assets-test.cloud.scannget.com',
  clientPanelUrl: 'https://client-test.cloud.scannget.com',
  outlookId: process.env.OUTLOOK_ID,
  outlookPass: process.env.OUTLOOK_PASS,
  oneSignalApiKey: process.env.ONE_SIGNAL_API_KEY,
  oneSignalAppId: process.env.ONE_SIGNAL_APP_ID,
  IOTPublishEndpoint: process.env.AWS_IOT_ENDPOINT
};
