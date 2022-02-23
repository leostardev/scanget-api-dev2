/**
 * @api {post} /invite/ Add Deal
 * @apiName Create Invite
 * @apiGroup Invite
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} user mongoDB id of the invite creator
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data._id unique id of the deal
 * @apiSuccess {String} data.code unique invite code of the invite
 * @apiSuccess {String} data.active (true / false )
 * @apiSuccess {String} data.initiator user who created invite
 * @apiSuccess {String[]} data.availedBy array of user ids who availed invites
 * @apiSuccess {String} data.createdAt deal creation date
 * @apiSuccess {String} data.updatedAt deal latest updation date
 * @apiSuccess {String} success (true / false)
*/
/**
 * @api {post} /invite/accept Accept Invite
 * @apiName Accept Invite
 * @apiGroup Invite
 *
 * @apiHeader {String} Authorization IdToken provided by AWS Cognito
 *
 * @apiParam {String} user Mongo Id of the invite accepting user
 * @apiParam {String} code unique invite code of the invite
 *
 * @apiSuccess {Object} data Response data object.
 * @apiSuccess {String} data.message Successfully accepted invite
 * @apiSuccess {String} success (true / false)
*/
