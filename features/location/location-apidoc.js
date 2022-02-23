/**
 * @api {post} /location/ Add Location
 * @apiName Add Location
 * @apiGroup Location
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the location
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the location
 * @apiSuccess {String} data.name name of the location
 * @apiSuccess {String} data.createdAt location creation date
 * @apiSuccess {String} data.updatedAt location latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /location/{locationId} Edit Location
 * @apiName Edit Location
 * @apiGroup Location
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the location
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the location
 * @apiSuccess {String} data.name name of the location
 * @apiSuccess {String} data.createdAt location creation date
 * @apiSuccess {String} data.updatedAt location latest updation date
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {delete} /location/{locationId} Delete Location
 * @apiName Delete Location
 * @apiGroup Location
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted location
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {get} /location/ Get all Categories
 * @apiName Get all Categories
 * @apiGroup Location
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object[]} data Array of locations object.
 * @apiSuccess {String} data._id unique id of the location
 * @apiSuccess {String} data.name name of the location
 * @apiSuccess {String} data.createdAt location creation date
 * @apiSuccess {String} data.updatedAt location latest updation date
 * @apiSuccess {String} success (true / false)
*/
