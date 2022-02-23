/**
 * @api {post} /faq/ Add FAQ
 * @apiName Add FAQ
 * @apiGroup FAQ
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} question Question
 * @apiParam {String} answer Answer
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the faq
 * @apiSuccess {String} data.sid unique short id of the faq
 * @apiSuccess {String} data.question Question
 * @apiSuccess {String} data.answer Answer
 * @apiSuccess {String} data.createdAt faq creation date
 * @apiSuccess {String} data.updatedAt faq latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {put} /faq/{faqId} Edit FAQ
 * @apiName Edit FAQ
 * @apiGroup FAQ
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} faqId FaqId mongoId
 * @apiParam {String} question Question ( Optional )
 * @apiParam {String} answer Answer ( Optional )
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the faq
 * @apiSuccess {String} data.sid unique short id of the faq
 * @apiSuccess {String} data.question Question
 * @apiSuccess {String} data.answer Answer
 * @apiSuccess {String} data.createdAt faq creation date
 * @apiSuccess {String} data.updatedAt faq latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {delete} /faq/{faqId} Delete FAQ
 * @apiName Delete FAQ
 * @apiGroup FAQ
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully deleted faq
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {get} /faq/ Get all FAQs
 * @apiName Get all FAQs
 * @apiGroup FAQ
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiSuccess {Object[]} data Aray of faqs object.
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the faq
 * @apiSuccess {String} data.sid unique short id of the faq
 * @apiSuccess {String} data.question Question
 * @apiSuccess {String} data.answer Answer
 * @apiSuccess {String} data.createdAt faq creation date
 * @apiSuccess {String} data.updatedAt faq latest updation date
 * @apiSuccess {String} success (true / false)
*/

