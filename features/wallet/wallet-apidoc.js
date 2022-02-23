/**
 * @api {get} /wallet/ Get wallet by userId
 * @apiName Get wallet by userId
 * @apiGroup Wallet
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {Object[]} data.transactions transaction history array
 * @apiSuccess {String} data.transactions._id unique id of the transaction
 * @apiSuccess {String} data.transactions.sid unique short id of the transaction
 * @apiSuccess {String} data.transactions.active true
 * @apiSuccess {String} data.transactions.account_title Account title
 * @apiSuccess {String} data.transactions.status (Pending/Completed)
 * @apiSuccess {Number} data.transactions.iban_no Account number
 * @apiSuccess {Number} data.transactions.bank_name Bank name
 * @apiSuccess {Number} data.transactions.swift_code Swift/BIC Code
 * @apiSuccess {Number} data.transactions.comment Optional comment
 * @apiSuccess {Number} data.transactions.amount Transaction Amount
 * @apiSuccess {Number} data.transactions.user User mongo Id
 * @apiSuccess {String} data.transactions.createdAt transaction creation date
 * @apiSuccess {String} data.transactions.updatedAt transaction latest updation date
 * @apiSuccess {String} data.sid unique short id of the wallet
 * @apiSuccess {String} data.user user id to which this wallet belongs to
 * @apiSuccess {Number} data.amount amount in the wallet
 * @apiSuccess {String} data.createdAt wallet creation date
 * @apiSuccess {String} data.updatedAt wallet latest updation date
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {put} /wallet/{walletId} Update wallet amount
 * @apiName Update wallet amount
 * @apiGroup Wallet
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} walletId Id of the wallet
 * @apiParam {String} user user mongoId
 * @apiParam {String} amount amount to increment or decrement ( like 50 / -50 )
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {Object[]} data.transactions transaction history array
 * @apiSuccess {String} data.transactions._id unique id of the transaction
 * @apiSuccess {String} data.transactions.sid unique short id of the transaction
 * @apiSuccess {String} data.transactions.active true
 * @apiSuccess {String} data.transactions.account_title Account title
 * @apiSuccess {String} data.transactions.status (Pending/Completed)
 * @apiSuccess {Number} data.transactions.account_no Account number
 * @apiSuccess {Number} data.transactions.bank_name Bank name
 * @apiSuccess {Number} data.transactions.branch_no Branch number
 * @apiSuccess {Number} data.transactions.amount Transaction Amount
 * @apiSuccess {Number} data.transactions.user User mongo Id
 * @apiSuccess {String} data.transactions.createdAt transaction creation date
 * @apiSuccess {String} data.transactions.updatedAt transaction latest updation date
 * @apiSuccess {String} data.sid unique short id of the wallet
 * @apiSuccess {String} data.user user id to which this wallet belongs to
 * @apiSuccess {Number} data.amount amount in the wallet
 * @apiSuccess {String} data.createdAt wallet creation date
 * @apiSuccess {String} data.updatedAt wallet latest updation date
 * @apiSuccess {String} success (true / false)
*/
