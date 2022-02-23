/**
 * @api {post} /sector/ Add Sector
 * @apiName Add Sector
 * @apiGroup Sector
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the sector
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the sector
 * @apiSuccess {String} data.name name of the sector
 * @apiSuccess {String} data.createdAt sector creation date
 * @apiSuccess {String} data.updatedAt sector latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /sector/{sectorId} Edit Sector
 * @apiName Edit Sector
 * @apiGroup Sector
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the sector
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the sector
 * @apiSuccess {String} data.name name of the sector
 * @apiSuccess {String} data.createdAt sector creation date
 * @apiSuccess {String} data.updatedAt sector latest updation date
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {delete} /sector/{sectorId} Delete Sector
 * @apiName Delete Sector
 * @apiGroup Sector
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted sector
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {get} /sector/ Get all Categories
 * @apiName Get all Categories
 * @apiGroup Sector
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object[]} data Array of sectors object.
 * @apiSuccess {String} data._id unique id of the sector
 * @apiSuccess {String} data.name name of the sector
 * @apiSuccess {String} data.createdAt sector creation date
 * @apiSuccess {String} data.updatedAt sector latest updation date
 * @apiSuccess {String} success (true / false)
*/
