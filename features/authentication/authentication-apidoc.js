/**
 * @api {post} auth/signin Login
 * @apiName Login User
 * @apiGroup User
 *
 * @apiParam {String} email User's unique email.
 * @apiParam {String} password User's unique password.
 *
 * @apiSuccess {Object} cognito Contains the cognito user.
 * @apiSuccess {String} cognito.cognitoId CognitoId of the user
 * @apiSuccess {String} cognito.username Full name of user.
 * @apiSuccess {String} cognito.email Email of the user.
 * @apiSuccess {Object} mongoDB Contains mongodb user details.
 * @apiSuccess {String} mongoDB._id Contains user's unique id.
 * @apiSuccess {String} mongoDB._cognitoId user's unique cognito id.
 * @apiSuccess {String} mongoDB.username Full name of user.
 * @apiSuccess {String} mongoDB.email Email of the user.
 * @apiSuccess {String} mongoDB.location location of the user.
 * @apiSuccess {String} mongoDB.gender gender of the user.
 * @apiSuccess {String} mongoDB.phone phone number of the user.
 * @apiSuccess {String} mongoDB.createdAt user's creation date.
 * @apiSuccess {String} mongoDB.updatedAt user's last update date.
 * @apiSuccess {Object[]} mongoDB.categories Array of user favourite categories.
 * @apiSuccess {Object[]} mongoDB.favoriteDeals Array of user favourite deals.
 * @apiSuccess {Object} TokenContainer  Contains all the tokens.
 * @apiSuccess {String} TokenContainer.AccessToken  Contains the cognito Access Token.
 * @apiSuccess {String} TokenContainer.RefreshToken  Contains Cognito refresh token.
 * @apiSuccess {String} TokenContainer.IdToken  Contains cognito id token. You have to pass this token as Authorization in header
 */

/**
 * @api {post} auth/signup Signup User
 * @apiName Signup User
 * @apiGroup User
 *
 * @apiParam {String} username Full name of the user.
 * @apiParam {String} email Email of the user.
 * @apiParam {String} password User's unique password.
 * @apiParam {String} gender Gender of the user.
 * @apiParam {String} phone Phone number of the user.
 * @apiParam {String} location location of the user
 * @apiParam {String} inviteCode unique invite code provided by any user ( Optional )
 *
 *
 * @apiSuccess {Object} cognito Contains the cognito user.
 * @apiSuccess {String} cognito.cognitoId CognitoId of the user
 * @apiSuccess {String} cognito.username Full name of user.
 * @apiSuccess {String} cognito.email Email of the user.
 * @apiSuccess {Object} mongoDB Contains mongodb user details.
 * @apiSuccess {String} mongoDB._id Contains user's unique id.
 * @apiSuccess {String} mongoDB._cognitoId user's unique cognito id.
 * @apiSuccess {String} mongoDB.username Full name of user.
 * @apiSuccess {String} mongoDB.email Email of the user.
 * @apiSuccess {String} mongoDB.phone Phone number of the user.
 * @apiSuccess {String} mongoDB.region region of the user location.
 * @apiSuccess {String} mongoDB.area area of the user location.
 * @apiSuccess {String} mongoDB.gender gender of the user.
 * @apiSuccess {Object[]} mongoDB.categories Array of user favourite categories.
 * @apiSuccess {Object[]} mongoDB.favoriteDeals Array of user favourite deals.
 * @apiSuccess {String} mongoDB.createdAt user's creation date.
 * @apiSuccess {String} mongoDB.updatedAt user's last update date.
 * @apiSuccess {Object} TokenContainer  Contains all the tokens.
 * @apiSuccess {String} TokenContainer.AccessToken  Contains the cognito Access Token.
 * @apiSuccess {String} TokenContainer.RefreshToken  Contains Cognito refresh token.
 * @apiSuccess {String} TokenContainer.IdToken  Contains cognito id token. You have to pass this token as Authorization in header
 */

/**
 * @api {post} auth/forgot-password Forgot Password
 * @apiName Forgot Password
 * @apiGroup User
 *
 * @apiParam {String} email Email of the user.
 *
 * @apiSuccess {Object} data Contains information of email sent.
 * @apiSuccess {Object} data.CodeDeliveryDetails Object containing email sent details.
 * @apiSuccess {String} data.CodeDeliveryDetails.Destination email address of the user with hidden letters ( e.g 'z*\*\*\*@s\*\*\*.com')
 * @apiSuccess {String} data.CodeDeliveryDetails.DeliveryMedium "EMAIL"
 * @apiSuccess {String} data.CodeDeliveryDetails.AttributeName "email"
 * @apiSuccess {Boolean} success True/False.
 */

/**
 * @api {post} auth/verify-pin Verify Pin
 * @apiName Verify Pin
 * @apiGroup User
 *
 * @apiParam {String} email Email of the user.
 * @apiParam {String} password User's unique password.
 * @apiParam {String} code 6 digit verification code.
 *
 * @apiSuccess {Boolean} success True/False.
 */

/**
 * @api {post} auth/change-password Change password of the user
 * @apiName Change Password
 * @apiGroup User
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} token Access token of the user.
 * @apiParam {String} oldPassword User old password.
 * @apiParam {String} newPassword User new password.
 *
 * @apiSuccess {Object} data response data object.
 * @apiSuccess {Object} data.message Password has been successfully changed.
 * @apiSuccess {Boolean} success True/False.
 */

/**
 * @api {post} auth/refresh Refresh Token
 * @apiName Refresh Token
 * @apiGroup User
 *
 * @apiParam {String} refreshToken User's unique refreshToken.
 *
 * @apiSuccess {Boolean} success True/False.
 * @apiSuccess {Object} data Contains token information.
 * @apiSuccess {String} data.AccessToken Contains access token.
 * @apiSuccess {String} data.IdToken Contains id token.
 */

/**
 * @api {post} auth/verification/get Send Verification code to email
 * @apiName Send Verification code to email
 * @apiGroup Transaction
 *
 * @apiParam {String} accessToken User's unique accessToken.
 *
 * @apiSuccess {Boolean} success True/False.
 * @apiSuccess {Object} data Contains response.
 * @apiSuccess {Object} data.CodeDeliveryDetails Object containing code delivery details
 * @apiSuccess {Object} data.CodeDeliveryDetails.Destination example z*\*\*@s\*\*\*.com
 * @apiSuccess {Object} data.CodeDeliveryDetails.DeliveryMedium EMAIL
 * @apiSuccess {Object} data.CodeDeliveryDetails.AttributeName email
 * @apiSuccess {String} success true
 */
