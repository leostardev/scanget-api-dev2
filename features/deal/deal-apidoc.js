/**
 * @api {post} /deal/ Add Deal
 * @apiName Add Deal
 * @apiGroup Deal
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} title title of the deal
 * @apiParam {String} description description of the deal
 * @apiParam {String} image image url of the deal
 * @apiParam {String} category category id the deal belongs to
 * @apiParam {String} product product id on which deal is
 * @apiParam {String} conditions terms and conditions for the deals
 * @apiParam {String} dType deal type either normal or flash
 * @apiParam {Date} startDate start date of the deal
 * @apiParam {Date} endDate end date of the deal
 * @apiParam {Number} savingAmount Amount saving on deal
 * @apiParam {String} otherSavings array of the savings w.r.t retailers and shops
 * @apiParam {String} otherSavings.retailer id of the retailer
 * @apiParam {String} otherSavings.shop shop name of the retailer on which deal is available
 * @apiParam {Number} otherSavings.amount discount amount
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the deal
 * @apiSuccess {String} data.sid unique short id of the deal
 * @apiSuccess {String} data.title title of the deal
 * @apiSuccess {String} data.description description of the deal
 * @apiSuccess {String} data.image image url of the deal
 * @apiSuccess {Object} data.category category object of the deal
 * @apiSuccess {Object} data.product product object of the deal
 * @apiSuccess {Date} data.startDate start date of the deal
 * @apiSuccess {Date} data.endDate end date of the deal
 * @apiSuccess {String} data.conditions terms and conditions of the deal
 * @apiSuccess {Number} data.savingAmount Amount saving on deal
 * @apiSuccess {String} data.otherSavings array of the savings w.r.t retailers and shops
 * @apiSuccess {Object} data.otherSavings.retailer object of the retailer
 * @apiSuccess {String} data.otherSavings.shop shop name of the retailer on which deal is available
 * @apiSuccess {String} data.otherSavings.amount discount amount
 * @apiSuccess {String} data.dType type of the deal ( normal / flash )
 * @apiSuccess {String} data.dType type of the deal ( normal / flash )
 * @apiSuccess {String} data.dType type of the deal ( normal / flash )
 * @apiSuccess {String} data.dType type of the deal ( normal / flash )
 * @apiSuccess {String} data.createdAt deal creation date
 * @apiSuccess {String} data.updatedAt deal latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /deal/{dealId} Edit Deal
 * @apiName Edit Deal
 * @apiGroup Deal
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} title title of the deal ( Optional )
 * @apiParam {String} description description of the deal ( Optional )
 * @apiParam {String} image image url of the deal ( Optional )
 * @apiParam {String} category category id the deal belongs to ( Optional )
 * @apiParam {String} product product id on which deal is ( Optional )
 * @apiParam {String} conditions terms and conditions for the deals ( Optional )
 * @apiParam {String} dType deal type either normal or flash ( Optional )
 * @apiParam {Date} startDate start date of the deal ( Optional )
 * @apiParam {Date} endDate end date of the deal ( Optional )
 * @apiParam {Number} data.savingAmount Amount saving on deal ( Optional )
 * @apiParam {String} data.otherSavings array of the savings w.r.t retailers and shops ( Optional )
 * @apiParam {String} data.otherSavings.retailer id of the retailer ( Optional )
 * @apiParam {String} data.otherSavings.shop shop name of the retailer on which deal is available ( Optional )
 * @apiParam {Number} data.otherSavings.amount discount amount ( Optional )
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the deal
 * @apiSuccess {String} data.sid unique short id of the deal
 * @apiSuccess {String} data.title title of the deal
 * @apiSuccess {String} data.description description of the deal
 * @apiSuccess {String} data.image image url of the deal
 * @apiSuccess {Object} data.category category object of the deal
 * @apiSuccess {Object} data.product product object of the deal
 * @apiSuccess {Date} data.startDate start date of the deal
 * @apiSuccess {Date} data.endDate end date of the deal
 * @apiSuccess {String} data.conditions terms and conditions of the deal
 * @apiSuccess {Number} data.savingAmount Amount saving on deal
 * @apiSuccess {String} data.otherSavings array of the savings w.r.t retailers and shops
 * @apiSuccess {Object} data.otherSavings.retailer object of the retailer
 * @apiSuccess {String} data.otherSavings.shop shop name of the retailer on which deal is available
 * @apiSuccess {String} data.otherSavings.amount discount amount
 * @apiSuccess {String} data.dType type of the deal ( normal / flash )
 * @apiSuccess {String} data.createdAt deal creation date
 * @apiSuccess {String} data.updatedAt deal latest updation date
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {delete} /deal/{dealId} Delete Deal
 * @apiName Delete Deal
 * @apiGroup Deal
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted deal
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {get} /deal/ Get all Deals
 * @apiName Get all Deals
 * @apiGroup Deal
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object[]} data Array of deals object.
 * @apiSuccess {String} data._id unique id of the deal
 * @apiSuccess {String} data.sid unique short id of the deal
 * @apiSuccess {String} data.title title of the deal
 * @apiSuccess {String} data.description description of the deal
 * @apiSuccess {String} data.image image url of the deal
 * @apiSuccess {Object} data.category category object of the deal
 * @apiSuccess {String} data.category._id unique id of the category
 * @apiSuccess {String} data.category.sid unique short id of the category
 * @apiSuccess {String} data.category.name name of the category
 * @apiSuccess {String} data.category.createdAt category creation date
 * @apiSuccess {String} data.category.updatedAt category latest updation date
 * @apiSuccess {Object} data.product product object of the deal
 * @apiSuccess {String} data.product._id unique id of the product
 * @apiSuccess {String} data.product.sid unique short id of the product
 * @apiSuccess {String} data.product.name name of the product
 * @apiSuccess {String} data.product.category Id of the category the product belongs to
 * @apiSuccess {String} data.product.createdAt product creation date
 * @apiSuccess {String} data.product.updatedAt product latest updation date
 * @apiSuccess {Date} data.startDate start date of the deal
 * @apiSuccess {Date} data.endDate end date of the deal
 * @apiSuccess {String} data.conditions terms and conditions of the deal
 * @apiSuccess {String} data.dType type of the deal ( normal / flash )
 * @apiSuccess {String} data.createdAt deal creation date
 * @apiSuccess {String} data.updatedAt deal latest updation date
 * @apiSuccess {String} success (true / false)
*/
