module.exports = {
  'receipt.accept': {
    title: 'Receipt Accepted',
    description: 'The receipt dated on the {receipt_date} with number {receipt_id} was accepted{message}',
    notificationType: 'Accepted Receipts'
  },
  'receipt.reject': {
    title: 'Receipt Rejected',
    description: '{reason}',
    notificationType: 'Rejected Receipts'
  },
  'receipt.approve': {
    title: 'Receipt Approved',
    description: 'Congratulations, the receipt you provided has been transitioned to processing stage',
    notificationType: 'Approved Receipts'
  },
  'transaction.complete': {
    title: 'Transaction Completed',
    description: 'Your {dType} transaction for €{amount} has been completed successfully',
    notificationType: 'Completed Transaction'
  },
  'transfer.successful': {
    title: 'Amount Transfered Successfully',
    description: '€{amount} has been successfully transferred to your bank account',
    notificationType: 'Completed Transfer'
  },
  'points.redeem': {
    title: 'Points Redeemed Successfully',
    description: '{points} points has been successfully redeemed and corresponding amount is added to your ScanNGet wallet',
    notificationType: 'Points Redeem'
  },
  'points.adjustment': {
    title: 'Points Adjustment done by the ScanNGet',
    description: '{points} points adjustment has been done by {source}',
    // description: '{points} points adjustment has been done by the ScanNGet',
    notificationType: 'Points Adjustment'
  }
};
