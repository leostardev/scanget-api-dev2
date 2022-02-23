/**
 * @api {post} /promotion/ Add Promotion
 * @apiName Add Promotion
 * @apiGroup Promotion
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} description description of the promotion
 * @apiParam {String} banner banner url of the promotionons
 * @apiParam {String} deal deal Id on which this promotion is available
 * @apiParam {Date} startDate start date of the promotion
 * @apiParam {Date} endDate end date of the promotion
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the promotion
 * @apiSuccess {String} data.sid unique short id of the promotion
 * @apiSuccess {String} data.active (true / false )
 * @apiSuccess {String} data.description description of the promotion
 * @apiSuccess {String} data.banner banner url of the promotion
 * @apiSuccess {Date} data.startDate start date of the promotion
 * @apiSuccess {Date} data.endDate end date of the promotion
 * @apiSuccess {String} data.createdAt promotion creation date
 * @apiSuccess {String} data.updatedAt promotion latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /promotion/{promotionId} Edit Promotion
 * @apiName Edit Promotion
 * @apiGroup Promotion
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} description description of the promotion ( Optional )
 * @apiParam {String} banner banner url of the promotionons ( Optional )
 * @apiParam {String} deal deal Id on which this promotion is available ( Optional )
 * @apiParam {Date} startDate start date of the promotion ( Optional )
 * @apiParam {Date} endDate end date of the promotion ( Optional )
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the promotion
 * @apiSuccess {String} data.sid unique short id of the promotion
 * @apiSuccess {String} data.active (true / false )
 * @apiSuccess {String} data.description description of the promotion
 * @apiSuccess {String} data.banner banner url of the promotion
 * @apiSuccess {Date} data.startDate start date of the promotion
 * @apiSuccess {Date} data.endDate end date of the promotion
 * @apiSuccess {String} data.createdAt promotion creation date
 * @apiSuccess {String} data.updatedAt promotion latest updation date
 * @apiSuccess {String} success (true/false)
*/

/**
 * @api {delete} /promotion/{promotionId} Delete Promotion
 * @apiName Delete Promotion
 * @apiGroup Promotion
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted promotion
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {get} /promotion/ Get all Promotions
 * @apiName Get all Promotions
 * @apiGroup Promotion
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object[]} data Array of all active promtions.
 * @apiSuccess {String} data._id unique id of the promotion
 * @apiSuccess {String} data.sid unique short id of the promotion
 * @apiSuccess {String} data.active (true / false )
 * @apiSuccess {String} data.description description of the promotion
 * @apiSuccess {String} data.banner banner url of the promotion
 * @apiSuccess {Date} data.startDate start date of the promotion
 * @apiSuccess {Date} data.endDate end date of the promotion
 * @apiSuccess {String} data.createdAt promotion creation date
 * @apiSuccess {String} data.updatedAt promotion latest updation date
 * @apiSuccess {String} success (true / false)
*/
