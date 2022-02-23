/**
 * @api {post} /transaction/transfer Add Transfer Transaction
 * @apiName Add Transaction
 * @apiGroup Transaction
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} bank_name Bank name
 * @apiParam {String} swift_code SWIFT/BIC Code
 * @apiParam {String} iban_no IBAN number
 * @apiParam {String} comment Optional comment added by the user for reference
 * @apiParam {String} account_title Account title
 * @apiParam {String} amount Amount to redeem
 * @apiParam {String} user user mongo Id
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the transaction
 * @apiSuccess {String} data.sid unique short id of the transaction
 * @apiSuccess {String} data.active true
 * @apiSuccess {String} data.account_title Account title
 * @apiSuccess {String} data.status (Pending/Completed)
 * @apiSuccess {Number} data.iban_no IBAN Number
 * @apiSuccess {Number} data.bank_name Bank name
 * @apiSuccess {Number} data.swift_code SWIFT/BIC Code
 * @apiSuccess {Number} data.comment Optional comment added by the user for reference
 * @apiSuccess {Number} data.amount Transaction Amount
 * @apiSuccess {Number} data.user User mongo Id
 * @apiSuccess {String} data.createdAt transaction creation date
 * @apiSuccess {String} data.updatedAt transaction latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /transaction/{transactionId} Edit Transaction
 * @apiName Edit Transaction
 * @apiGroup Transaction
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} status (Pending/Completed) ( Optional )
 * @apiParam {String} amount amount of the transaction ( Optional )
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the transaction
 * @apiSuccess {String} data.sid unique short id of the transaction
 * @apiSuccess {String} data.active true
 * @apiSuccess {String} data.account_title Account title
 * @apiSuccess {String} data.status (Pending/Completed)
 * @apiSuccess {Number} data.account_no Account number
 * @apiSuccess {Number} data.bank_name Bank name
 * @apiSuccess {Number} data.branch_no Branch number
 * @apiSuccess {Number} data.amount Transaction Amount
 * @apiSuccess {Number} data.user User mongo Id
 * @apiSuccess {String} data.createdAt transaction creation date
 * @apiSuccess {String} data.updatedAt transaction latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {delete} /transaction/{transactionId} Delete Transaction
 * @apiName Delete Transaction
 * @apiGroup Transaction
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted transaction
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {post} /transaction/all?minDate={minDate}&maxDate={maxDate} Get all Transactions
 * @apiName Get all Transactions
 * @apiGroup Transaction
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} status (Pending/Approved/Accepted/Rejected) ( Optional )
 * @apiParam {String} user user mongo Id ( Optional )
 * @apiParam {String} year Year of which transactions are required ( Optional Query Param)
 * @apiParam {String} month Month of which transactions are required ( Optional Query Param)
 * @apiParam {String} user user mongo Id ( Optional )
 *
 * @apiSuccess {Object[]} data Aray of transactions object.
 * @apiSuccess {String} data._id unique id of the transaction
 * @apiSuccess {String} data.sid unique short id of the transaction
 * @apiSuccess {String} data.active true
 * @apiSuccess {String} data.account_title Account title
 * @apiSuccess {String} data.status (Pending/Completed)
 * @apiSuccess {Number} data.account_no Account number
 * @apiSuccess {Number} data.bank_name Bank name
 * @apiSuccess {Number} data.branch_no Branch number
 * @apiSuccess {Number} data.amount Transaction Amount
 * @apiSuccess {Number} data.user User mongo Id
 * @apiSuccess {String} data.createdAt transaction creation date
 * @apiSuccess {String} data.updatedAt transaction latest updation date
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {post} /transaction/recharge Add Recharge Transaction
 * @apiName Add Transaction
 * @apiGroup Transaction
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} accessToken User access token
 * @apiParam {String} code verification code emailed to user
 * @apiParam {String} phoneNo user phone number
 * @apiParam {String} amount Amount to redeem
 * @apiParam {String} user user mongo Id
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the transaction
 * @apiSuccess {String} data.sid unique short id of the transaction
 * @apiSuccess {String} data.active true
 * @apiSuccess {String} data.status (Pending/Completed)
 * @apiSuccess {Number} data.phoneNo Phone number for which recharge request is created
 * @apiSuccess {Number} data.amount Transaction Amount
 * @apiSuccess {Number} data.user User mongo Id
 * @apiSuccess {String} data.createdAt transaction creation date
 * @apiSuccess {String} data.updatedAt transaction latest updation date
 * @apiSuccess {String} success (true / false)
*/
