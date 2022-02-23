/**
 * @api {post} /favorite Add deal to favorites
 * @apiName Add deal to favorites
 * @apiGroup Favorite
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} user mongoId of the user
 * @apiParam {String} deal deal id
 *
 * @apiSuccess {Object} data Response data objects.
 * @apiSuccess {String} data._id Contains user's unique id.
 * @apiSuccess {String} data._cognitoId user's unique cognito id.
 * @apiSuccess {String} data.username Full name of user.
 * @apiSuccess {String} data.email Email of the user.
 * @apiSuccess {String} data.phone Phone number of the user.
 * @apiSuccess {String} data.lat latitude of the user location.
 * @apiSuccess {String} data.lng longitude of the user location.
 * @apiSuccess {String} data.countryCode Country code of the user.
 * @apiSuccess {String} data.gender gender of the user.
 * @apiSuccess {String} data.createdAt user's creation date.
 * @apiSuccess {String} data.updatedAt user's last update date.
 * @apiSuccess {Object[]} data.categories Array of user favourite categories.
 * @apiSuccess {Object[]} data.favoriteDeals Array of user favourite deals.
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {put} /favorite/remove Remove deal = require(favorites
 * @apiName Remove deal = require(favorites
 * @apiGroup Favorite
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} user mongoId of the user
 * @apiParam {String} deal deal id
 *
 * @apiSuccess {Object} data Response data objects.
 * @apiSuccess {String} data._id Contains user's unique id.
 * @apiSuccess {String} data._cognitoId user's unique cognito id.
 * @apiSuccess {String} data.username Full name of user.
 * @apiSuccess {String} data.email Email of the user.
 * @apiSuccess {String} data.phone Phone number of the user.
 * @apiSuccess {String} data.lat latitude of the user location.
 * @apiSuccess {String} data.lng longitude of the user location.
 * @apiSuccess {String} data.countryCode Country code of the user.
 * @apiSuccess {String} data.gender gender of the user.
 * @apiSuccess {String} data.createdAt user's creation date.
 * @apiSuccess {String} data.updatedAt user's last update date.
 * @apiSuccess {Object[]} data.categories Array of user favourite categories.
 * @apiSuccess {Object[]} data.favoriteDeals Array of user favourite deals.
 * @apiSuccess {String} success (true / false)
*/

