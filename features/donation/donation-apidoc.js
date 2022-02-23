/**
 * @api {post} /donation/ Add Donation
 * @apiName Add Donation
 * @apiGroup Donation
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the donation
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the donation
 * @apiSuccess {String} data.name name of the donation
 * @apiSuccess {String} data.createdAt donation creation date
 * @apiSuccess {String} data.updatedAt donation latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /donation/{donationId} Edit Donation
 * @apiName Edit Donation
 * @apiGroup Donation
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the donation
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the donation
 * @apiSuccess {String} data.name name of the donation
 * @apiSuccess {String} data.createdAt donation creation date
 * @apiSuccess {String} data.updatedAt donation latest updation date
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {delete} /donation/{donationId} Delete Donation
 * @apiName Delete Donation
 * @apiGroup Donation
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted donation
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {get} /donation/ Get all Categories
 * @apiName Get all Categories
 * @apiGroup Donation
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object[]} data Array of donations object.
 * @apiSuccess {String} data._id unique id of the donation
 * @apiSuccess {String} data.name name of the donation
 * @apiSuccess {String} data.createdAt donation creation date
 * @apiSuccess {String} data.updatedAt donation latest updation date
 * @apiSuccess {String} success (true / false)
*/
