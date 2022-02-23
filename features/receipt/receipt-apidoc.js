/**
 * @api {post} /receipt/ Add Receipt
 * @apiName Add Receipt
 * @apiGroup Receipt
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String[]} image image url of receipt
 * @apiParam {String} user user mongo Id
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the receipt
 * @apiSuccess {String} data.sid unique short id of the receipt
 * @apiSuccess {String} data.active true
 * @apiSuccess {String} data.image image url of receipt
 * @apiSuccess {String} data.status (Pending/Approved/Accepted/Rejected)
 * @apiSuccess {Number} data.amount amount of the receipt
 * @apiSuccess {String} data.createdAt receipt creation date
 * @apiSuccess {String} data.updatedAt receipt latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /receipt/{receiptId} Edit Receipt
 * @apiName Edit Receipt
 * @apiGroup Receipt
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} receiptId Id of the receipt
 * @apiParam {String} image image url of receipt ( Optional )
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the receipt
 * @apiSuccess {String} data.sid unique short id of the receipt
 * @apiSuccess {String} data.active true
 * @apiSuccess {String} data.image image url of receipt
 * @apiSuccess {String} data.status (Pending/Approved/Accepted/Rejected)
 * @apiSuccess {Number} data.amount amount of the receipt
 * @apiSuccess {String} data.createdAt receipt creation date
 * @apiSuccess {String} data.updatedAt receipt latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {delete} /receipt/{receiptId} Delete Receipt
 * @apiName Delete Receipt
 * @apiGroup Receipt
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted receipt
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {post} /receipt/all Get all Receipts
 * @apiName Get all Receipts
 * @apiGroup Receipt
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} status (Pending/Approved/Accepted/Rejected) ( Optional )
 * @apiParam {String} user user mongo Id ( Optional )
 *
 * @apiSuccess {Object[]} data Aray of receipts object.
 * @apiSuccess {String} data._id unique id of the receipt
 * @apiSuccess {String} data.sid unique short id of the receipt
 * @apiSuccess {String} data.active true
 * @apiSuccess {String} data.image image url of receipt
 * @apiSuccess {String} data.status (Pending/Approved/Accepted/Rejected)
 * @apiSuccess {Number} data.amount amount of the receipt
 * @apiSuccess {String} data.createdAt receipt creation date
 * @apiSuccess {String} data.updatedAt receipt latest updation date
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {put} /receipt/{receiptId}/admin Update receipt info
 * @apiName Update receipt info
 * @apiGroup Receipt
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} receiptId Receipt mongo id
 * @apiParam {String} status (Pending/Approved/Accepted/Rejected)
 * @apiParam {String} amount total amount of the receipt
 * @apiParam {String} description description of the receipt ( Optional )
 * @apiParam {String} receipt_data date on the receipt
 * @apiParam {Object} retailer_info Retailer_info
 * @apiParam {String} retailer_info.retailer Retailer mongo id
 * @apiParam {String} retailer_info.shop shop mongo id
 * @apiParam {Object[]} products products array extracted = require(the receipt
 * @apiParam {String} products.barcode barcode of the product
 * @apiParam {String} products.amount amount of the product
 * @apiParam {String} products.quantity quantity of the product
 * @apiParam {String} products.category category id to which the product belongs to
 * @apiParam {String} products.product product mongo id
 * @apiParam {String[]} deals array of deals that applied on this receipt
 *
 * @apiSuccess {Object[]} data Aray of receipts object.
 * @apiSuccess {String} data._id unique id of the receipt
 * @apiSuccess {String} data.sid unique short id of the receipt
 * @apiSuccess {String} data.active true
 * @apiSuccess {String} data.image image url of receipt
 * @apiSuccess {String} data.status (Pending/Approved/Accepted/Rejected)
 * @apiSuccess {Number} data.amount amount of the receipt
 * @apiSuccess {String} data.createdAt receipt creation date
 * @apiSuccess {String} data.updatedAt receipt latest updation date
 * @apiSuccess {String} success (true / false)
*/
