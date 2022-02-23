/**
 * @api {post} /product/ Add Product
 * @apiName Add Product
 * @apiGroup Product
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the product
 * @apiParam {String} category Id of the category the product belongs to
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the product
 * @apiSuccess {String} data.sid unique short id of the product
 * @apiSuccess {String} data.name name of the product
 * @apiSuccess {String} data.category Id of the category the product belongs to
 * @apiSuccess {String} data.createdAt product creation date
 * @apiSuccess {String} data.updatedAt product latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /product/{productId} Edit Product
 * @apiName Edit Product
 * @apiGroup Product
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} name Name of the product ( Optional )
 * @apiParam {String} category Id of the category the product belongs to ( Optional )
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the product
 * @apiSuccess {String} data.sid unique short id of the product
 * @apiSuccess {String} data.name name of the product
 * @apiSuccess {String} data.category Id of the category the product belongs to
 * @apiSuccess {String} data.createdAt product creation date
 * @apiSuccess {String} data.updatedAt product latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {delete} /product/{productId} Delete Product
 * @apiName Delete Product
 * @apiGroup Product
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} productId Id of the product
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted product
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {get} /product/ Get all Products
 * @apiName Get all Products
 * @apiGroup Product
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object[]} data Aray of products object.
 * @apiSuccess {String} data._id unique id of the product
 * @apiSuccess {String} data.sid unique short id of the product
 * @apiSuccess {String} data.name name of the product
 * @apiSuccess {Object} data.category category object the product belongs to
 * @apiSuccess {String} data.category._id unique id of the category
 * @apiSuccess {String} data.category.sid unique short id of the category
 * @apiSuccess {String} data.category.name name of the category
 * @apiSuccess {String} data.category.createdAt category creation date
 * @apiSuccess {String} data.category.updatedAt category latest updation date
 * @apiSuccess {String} data.createdAt product creation date
 * @apiSuccess {String} data.updatedAt product latest updation date
 * @apiSuccess {String} success (true / false)
*/

/**
 * @api {get} /product/category/{categoryId} Get all Products by Category Id
 * @apiName Get all Products by Category Id
 * @apiGroup Product
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} categoryId category id of which products are required
 *
 * @apiSuccess {Object[]} data Aray of products object.
 * @apiSuccess {String} data._id unique id of the product
 * @apiSuccess {String} data.sid unique short id of the product
 * @apiSuccess {String} data.name name of the product
 * @apiSuccess {String} data.category category id the product belongs to
 * @apiSuccess {String} data.createdAt product creation date
 * @apiSuccess {String} data.updatedAt product latest updation date
 * @apiSuccess {String} success (true / false)
*/

