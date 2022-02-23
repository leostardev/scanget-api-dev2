/**
 * @api {post} /retailer/ Add Retailer
 * @apiName Add Retailer
 * @apiGroup Retailer
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the retailer
 * @apiParam {Object[]} shops Array of shops object (Optional)
 * @apiParam {String} shops.name Name of the shop
 * @apiParam {String} shops.location Location of the shop
 * @apiParam {Object} shops.working_days Object of days with boolean check
 * @apiParam {Boolean} shops.working_days.monday ( true / false )
 * @apiParam {Boolean} shops.working_days.tuesday ( true / false )
 * @apiParam {Boolean} shops.working_days.wednesday ( true / false )
 * @apiParam {Boolean} shops.working_days.thursday ( true / false )
 * @apiParam {Boolean} shops.working_days.friday ( true / false )
 * @apiParam {Boolean} shops.working_days.saturday ( true / false )
 * @apiParam {Boolean} shops.working_days.sunday ( true / false )
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the retailer
 * @apiSuccess {String} data.sid unique short id of the retailer
 * @apiSuccess {String} data.name name of the retailer
 * @apiSuccess {Object[]} data.shops Array of shops object
 * @apiSuccess {String} data.shops.name Name of the shop
 * @apiSuccess {String} data.shops.location Location of the shop
 * @apiSuccess {String} data.working_days Object of days with boolean check
 * @apiSuccess {String} data.working_days.monday ( true / false )
 * @apiSuccess {String} data.working_days.tuesday ( true / false )
 * @apiSuccess {String} data.working_days.wednesday ( true / false )
 * @apiSuccess {String} data.working_days.thursday ( true / false )
 * @apiSuccess {String} data.working_days.friday ( true / false )
 * @apiSuccess {String} data.working_days.saturday ( true / false )
 * @apiSuccess {String} data.working_days.sunday ( true / false )
 * @apiSuccess {String} data.createdAt retailer creation date
 * @apiSuccess {String} data.updatedAt retailer latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /retailer/{retailerId} Edit Retailer
 * @apiName Edit Retailer
 * @apiGroup Retailer
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the retailer ( Optional )
 * @apiParam {String} category Id of the category the retailer belongs to ( Optional )
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the retailer
 * @apiSuccess {String} data.sid unique short id of the retailer
 * @apiSuccess {String} data.name name of the retailer
 * @apiSuccess {String} data.category Id of the category the retailer belongs to
 * @apiSuccess {String} data.createdAt retailer creation date
 * @apiSuccess {String} data.updatedAt retailer latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {delete} /retailer/{retailerId} Delete Retailer
 * @apiName Delete Retailer
 * @apiGroup Retailer
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} retailerId Id of the retailer
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted retailer
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {get} /retailer/ Get all Retailers
 * @apiName Get all Retailers
 * @apiGroup Retailer
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object[]} data Aray of retailers object.
 * @apiSuccess {String} data._id unique id of the retailer
 * @apiSuccess {String} data.sid unique short id of the retailer
 * @apiSuccess {String} data.name name of the retailer
 * @apiSuccess {Object[]} data.shops Array of shops object
 * @apiSuccess {String} data.shops.name Name of the shop
 * @apiSuccess {String} data.shops.location Location of the shop
 * @apiSuccess {String} data.working_days Object of days with boolean check
 * @apiSuccess {String} data.working_days.monday ( true / false )
 * @apiSuccess {String} data.working_days.tuesday ( true / false )
 * @apiSuccess {String} data.working_days.wednesday ( true / false )
 * @apiSuccess {String} data.working_days.thursday ( true / false )
 * @apiSuccess {String} data.working_days.friday ( true / false )
 * @apiSuccess {String} data.working_days.saturday ( true / false )
 * @apiSuccess {String} data.working_days.sunday ( true / false )
 * @apiSuccess {String} data.createdAt retailer creation date
 * @apiSuccess {String} data.updatedAt retailer latest updation date
 * @apiSuccess {String} success (true / false)
*/

