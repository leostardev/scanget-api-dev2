/**
 * @api {post} /brand/ Add Brand
 * @apiName Add Brand
 * @apiGroup Brand
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the brand
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the brand
 * @apiSuccess {String} data.name name of the brand
 * @apiSuccess {String} data.createdAt brand creation date
 * @apiSuccess {String} data.updatedAt brand latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /brand/{brandId} Edit Brand
 * @apiName Edit Brand
 * @apiGroup Brand
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the brand
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the brand
 * @apiSuccess {String} data.name name of the brand
 * @apiSuccess {String} data.createdAt brand creation date
 * @apiSuccess {String} data.updatedAt brand latest updation date
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {delete} /brand/{brandId} Delete Brand
 * @apiName Delete Brand
 * @apiGroup Brand
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted brand
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {get} /brand/ Get all Categories
 * @apiName Get all Categories
 * @apiGroup Brand
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object[]} data Array of brands object.
 * @apiSuccess {String} data._id unique id of the brand
 * @apiSuccess {String} data.name name of the brand
 * @apiSuccess {String} data.createdAt brand creation date
 * @apiSuccess {String} data.updatedAt brand latest updation date
 * @apiSuccess {String} success (true / false)
*/
