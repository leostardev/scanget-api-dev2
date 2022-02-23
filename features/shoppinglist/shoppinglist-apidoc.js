/**
 * @api {post} /category/ Add Category
 * @apiName Add Category
 * @apiGroup Category
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the category
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the category
 * @apiSuccess {String} data.sid unique short id of the category
 * @apiSuccess {String} data.name name of the category
 * @apiSuccess {String} data.createdAt category creation date
 * @apiSuccess {String} data.updatedAt category latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /category/{categoryId} Edit Category
 * @apiName Edit Category
 * @apiGroup Category
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the category
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the category
 * @apiSuccess {String} data.sid unique short id of the category
 * @apiSuccess {String} data.name name of the category
 * @apiSuccess {String} data.createdAt category creation date
 * @apiSuccess {String} data.updatedAt category latest updation date
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {delete} /category/{categoryId} Delete Category
 * @apiName Delete Category
 * @apiGroup Category
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted category
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {get} /category/ Get all Categories
 * @apiName Get all Categories
 * @apiGroup Category
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object[]} data Array of categories object.
 * @apiSuccess {String} data._id unique id of the category
 * @apiSuccess {String} data.sid unique short id of the category
 * @apiSuccess {String} data.name name of the category
 * @apiSuccess {String} data.createdAt category creation date
 * @apiSuccess {String} data.updatedAt category latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {post} /category/mine Add category to my categories
 * @apiName Add category to my categories
 * @apiGroup Category
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} user mongoId of the user
 * @apiParam {String} category category id which user add to its categories
 *
 * @apiSuccess {Object} data Response data objects.
 * @apiSuccess {String} data._id Contains user's unique id.
 * @apiSuccess {String} data._cognitoId user's unique cognito id.
 * @apiSuccess {String} data.username Full name of user.
 * @apiSuccess {String} data.email Email of the user.
 * @apiSuccess {String} data.phone Phone number of the user.
 * @apiSuccess {String} data.location user location.
 * @apiSuccess {String} data.gender gender of the user.
 * @apiSuccess {String} data.createdAt user's creation date.
 * @apiSuccess {String} data.updatedAt user's last update date.
 * @apiSuccess {Object[]} data.categories Array of user favourite categories.
 * @apiSuccess {Object[]} data.favoriteDeals Array of user favourite deals.
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {put} /category/mine/remove Remove category = require(my categories
 * @apiName Remove category = require(my categories
 * @apiGroup Category
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} user mongoId of the user
 * @apiParam {String} category category id which user add to its categories
 *
 * @apiSuccess {Object} data Response data objects.
 * @apiSuccess {String} data._id Contains user's unique id.
 * @apiSuccess {String} data._cognitoId user's unique cognito id.
 * @apiSuccess {String} data.username Full name of user.
 * @apiSuccess {String} data.email Email of the user.
 * @apiSuccess {String} data.phone Phone number of the user.
 * @apiSuccess {String} data.location user location.
 * @apiSuccess {String} data.gender gender of the user.
 * @apiSuccess {String} data.createdAt user's creation date.
 * @apiSuccess {String} data.updatedAt user's last update date.
 * @apiSuccess {Object[]} data.categories Array of user favourite categories.
 * @apiSuccess {Object[]} data.favoriteDeals Array of user favourite deals.
 * @apiSuccess {String} success (true / false)
*/

