/**
 * @api {get} user/me Get User Details
 * @apiName Get User Details
 * @apiGroup User
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
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
 */

/**
 * @api {put} user/me Update User Details
 * @apiName Update User Details
 * @apiGroup User
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} username Full name of the user ( Optional ).
 * @apiParam {String} phone Phone number of the user ( Optional ).
 * @apiParam {String} location Location of the user ( Optional ).
 * @apiParam {String} gender Gender of the user ( Optional ).
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
 * @apiSuccess {String} mongoDB.lat latitude of the user location.
 * @apiSuccess {String} mongoDB.lng longitude of the user location.
 * @apiSuccess {String} mongoDB.countryCode Country code of the user.
 * @apiSuccess {String} mongoDB.gender gender of the user.
 * @apiSuccess {Object[]} mongoDB.categories Array of user favourite categories.
 * @apiSuccess {String} mongoDB.createdAt user's creation date.
 * @apiSuccess {String} mongoDB.updatedAt user's last update date.
 */
