let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let faqHandler = require('./faq-handler');

router.route(`/`).post(verify.verifyAdmin, faqHandler.addFAQ);

router.route(`/:faqId`).put(verify.verifyAdmin, faqHandler.updateFAQ);

router.route(`/:faqId`).delete(verify.verifyAdmin, faqHandler.deleteFAQ);

router.route(`/`).get(verify.verifyUser, faqHandler.getAllFAQs);

router.route(`/ask`).post(verify.verifyUser, faqHandler.askQuestion);

router.route(`/contact-us`).post(verify.verifyUser, faqHandler.queryScannGetSupport);

module.exports = router;
