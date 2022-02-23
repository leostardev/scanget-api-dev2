let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let receiptHandler = require('./receipt-handler');

router.route(`/`).post(verify.verifyUser, receiptHandler.createReceipt);

router.route(`/:receiptId`).put(verify.verifyUser, receiptHandler.updateReceipt);

router.route(`/:receiptId`).delete(verify.verifyUser, receiptHandler.deleteReceipt);

router.route(`/all`).post(verify.verifyUser, receiptHandler.getAllReceipts);

router.route(`/:receiptId/approve`).put(verify.verifyAdmin, receiptHandler.approveReceipt);

router.route(`/:receiptId/revert-to-pending`).get(verify.verifyAdmin, receiptHandler.revertReceiptApproval);

router.route(`/:receiptId/revert-to-processing`).get(verify.verifyAdmin, receiptHandler.revertReceiptAcceptance);

router.route(`/:receiptId/reject`).put(verify.verifyAdmin, receiptHandler.rejectReceipt);

router.route(`/:receiptId/accept`).put(verify.verifyAdmin, receiptHandler.acceptReceipt);

router.route(`/image`).post(verify.verifyUser, receiptHandler.updateImage);

router.route(`/:receiptId`).get(verify.verifyUser, receiptHandler.getReceiptById);

router.route(`/accept/bulk`).put(verify.verifyAdmin, receiptHandler.acceptBulkReceipts);

router.route(`/id/get`).get(verify.verifyUser, receiptHandler.getReceiptId);

router.route(`/zip/get`).post(verify.verifyAdmin, receiptHandler.zipReceipts);

router.route(`/csv/get`).post(verify.verifyAdmin, receiptHandler.exportReceiptsToCsv);

router.route(`/summary/:month/:year`).get(verify.verifyAdmin, receiptHandler.getReceiptsSummary);

router.route(`/summary-csv/:month/:year`).get(verify.verifyAdmin, receiptHandler.getReceiptsSummaryCSV);

router.route(`/download-all-receipts`).post(verify.verifyAdmin, receiptHandler.downloadReceiptImages);

module.exports = router;
