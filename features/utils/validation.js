const joi = require('joi');
const R = require('ramda');

joi.objectId = require('joi-objectid')(joi);

const getPlainError = joiError => R.path(['error', 'details', 0, 'message'], joiError);

module.exports.checkSignUpSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    username: joi.string().required(),
    email: joi.string().regex(/^([\w]+[^"(),:;<>@[\]]+@([\w-]+\.)+[\w-]+)?$/).required(),
    phone: joi.string().required().allow(['']),
    gender: joi.string().required().allow(['']),
    password: joi.string().required(),
    location: joi.string().required().allow(['']),
    year_of_birth: joi.string().required().allow(['']),
    language: joi.string().allow(['']).required(),
    inviteCode: joi.string().allow(['']),
    familyCode: joi.string().allow(['']),
    phoneCode: joi.string().allow(['']),
    countryCode: joi.string().allow([''])
  });

  return getPlainError(joi.validate(rawData, schema));
};
module.exports.checkChangePasswordSchema = rawData => {
  const schema = joi.object().keys({
    token: joi.string().required(),
    oldPassword: joi.string().required(),
    newPassword: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.checkUpdateUserSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    firstName: joi.string(),
    lastName: joi.string(),
    phone: joi.string(),
    language: joi.string().allow(['en', 'gr']),
    role: joi.string(),
    email: joi.string().regex(/^([\w]+[^"(),:;<>@[\]]+@([\w-]+\.)+[\w-]+)?$/).required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.checkSignInSchema = (rawData) => { // eslint-disable-line

  const schema = joi.object().keys({
    email: joi.string().required(),
    password: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.checkForgotPasswordSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    email: joi.string().regex(/^([\w]+[^"(),:;<>@[\]]+@([\w-]+\.)+[\w-]+)?$/).required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.checkVerifyPinSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    email: joi.string().required(),
    password: joi.string().required(),
    code: joi.string().required(),
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.checkUserUpdateSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    username: joi.string(),
    phone: joi.string().allow([null, '']),
    location: joi.string().allow([null, '']),
    gender: joi.string().allow([null, '']),
    nationality: joi.string().allow([null, '']),
    year_of_birth: joi.string().allow([null, '']),
    language: joi.string().allow(['en', 'gr']),
    image: joi.string().allow(null),
    pushNotifications: joi.boolean(),
    phoneCode: joi.string().allow(['']),
    countryCode: joi.string().allow(['']),
    termsAndConditionsVersion: joi.string(),
    hideImageCaptureGuideline: joi.boolean()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.createClientSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    email: joi.string().required(),
    name: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.createPackageSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    description: joi.string().required(),
    slots: joi.number().required(),
    banners: joi.number().required(),
    cost: joi.number().required(),
    duration: joi.number().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.requestClientPackageSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    packageId: joi.objectId().required(),
    clientId: joi.objectId().required(),
    startDate: joi.date().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.approveClientPackageSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    clientPackageId: joi.objectId().required(),
    startDate: joi.date(),
    slots: joi.number(),
    banners: joi.number(),
    cost: joi.number(),
    duration: joi.number()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.rejectClientPackageSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    clientPackageId: joi.objectId().required(),
    reason: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.generatePeriodsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    year: joi.number().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updatePackageSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    description: joi.string(),
    slots: joi.number(),
    banners: joi.number(),
    cost: joi.number(),
    duration: joi.number()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.createClientUserSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    email: joi.string().required(),
    name: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.removeClientUserSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    userId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateClientDetailsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    vat: joi.string(),
    itc: joi.string().allow(['']),
    address: joi.string(),
    postalCode: joi.string(),
    city: joi.string(),
    region: joi.string(),
    country: joi.string(),
    telephone: joi.string(),
    fax: joi.string().allow(['']),
    website: joi.string().allow(['']),
    logo: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addProductSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string().required(),
    category: joi.objectId().required(),
    barcode: joi.array(),
    client: joi.objectId().required(),
    price: joi.number()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCategorySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string().required(),
    sector: joi.objectId()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateProductSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string(),
    category: joi.objectId(),
    barcode: joi.array(),
    price: joi.number(),
    client: joi.objectId()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteProductSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    productId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getAllProductsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    client: joi.string().required(),
    search: joi.string().allow(['']),
    productId: joi.objectId(),
    skip: joi.string(),
    limit: joi.string(),
    category: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
}; module.exports.getAllPromotionsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    client: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};
module.exports.updateCategorySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string(),
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteCategorySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    categoryId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.checkDeactivateAccountSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    email: joi.string().required(),
    cognitoId: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.checkActivateAccountSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    email: joi.string().required(),
    cognitoId: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.checkDeactivateClientAccountSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    clientId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.checkActivateClientAccountSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    clientId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addDealSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    title: joi.string().required(),
    description: joi.string().required().allow(['']),
    image: joi.string().required(),
    dType: joi.string().allow(['normal', 'flash']).required(),
    // startDate: joi.date().required(),
    // endDate: joi.date().required(),
    periods: joi.array().required(),
    category: joi.objectId().required(),
    product: joi.objectId().required(),
    savingAmount: joi.number(),
    otherSavings: joi.array(),
    quantity: joi.number(),
    _id: joi.objectId().required(),
    client: joi.objectId().required(),
    limited: joi.boolean().required(),
    clientConditions: joi.string(),
    maxItems: joi.number(),
    weight: joi.number(),
    thumbnail: joi.string(),
    promoCode: joi.string(),
    savingType: joi.string(),
    savedPercent: joi.number()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addDealRetailerDiscountSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    retailer: joi.objectId().required(),
    shop: joi.array().required(),
    amount: joi.number().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getAllDealsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    dealId: joi.objectId(),
    search: joi.string().allow(['']),
    dType: joi.string(),
    minDate: joi.string(),
    maxDate: joi.string(),
    skip: joi.string(),
    limit: joi.string(),
    user: joi.objectId(),
    client: joi.objectId()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.editDealSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    title: joi.string(),
    description: joi.string().allow(['']),
    image: joi.string(),
    conditions: joi.string(),
    dType: joi.string().allow(['normal', 'flash']),
    startDate: joi.date(),
    endDate: joi.date(),
    periods: joi.array(),
    category: joi.objectId(),
    product: joi.objectId(),
    savingAmount: joi.number(),
    otherSavings: joi.array(),
    quantity: joi.number(),
    client: joi.objectId(),
    limited: joi.boolean(),
    clientConditions: joi.string(),
    maxItems: joi.number(),
    weight: joi.number(),
    thumbnail: joi.string(),
    promoCode: joi.string(),
    savingType: joi.string(),
    savedPercent: joi.number()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.approveDealSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    dealId: joi.objectId().required(),
    clientPackageId: joi.objectId().required(),
    conditions: joi.string(),
    weight: joi.number().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.rejectDealSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    dealId: joi.objectId().required(),
    reason: joi.string().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deactivateDealSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    dealId: joi.objectId().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteDealSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    dealId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.createInviteCodeSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    user: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.acceptInviteSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    code: joi.string().required(),
    availedBy: joi.objectId().required(),
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addPromotionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    banner: joi.string().required(),
    description: joi.string(),
    periods: joi.array().required(),
    deal: joi.objectId().required(),
    client: joi.objectId().required(),
    clientPackage: joi.objectId().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.editPromotionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    banner: joi.string(),
    description: joi.string(),
    periods: joi.array(),
    deal: joi.objectId(),
    client: joi.objectId(),
    clientPackage: joi.objectId()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deletePromotionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    promotionId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.approvePromotionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    promotionId: joi.objectId().required(),
    clientPackageId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.rejectPromotionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    promotionId: joi.objectId().required(),
    reason: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addToFavoriteSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    deal: joi.objectId().required(),
    user: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.removeFromFavoriteSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    deal: joi.objectId().required(),
    user: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addToMyCategoriesSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    category: joi.array().required(),
    user: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.removeFromMyCategoriesSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    category: joi.array().required(),
    user: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.createReceiptSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    image: joi.array(),
    user: joi.objectId().required(),
    _id: joi.objectId()
  });

  return getPlainError(joi.validate(rawData, schema));
}; module.exports.zipReceiptsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    keys: joi.array().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateReceiptSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    user: joi.objectId(),
    image: joi.array(),
    receiptId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteReceiptSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    receiptId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.receiptByUserIdSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    userId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getAllReceiptSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    user: joi.objectId(),
    status: joi.string().allow(['Pending', 'Accepted', 'Processing', 'Rejected']),
    minDate: joi.string(),
    maxDate: joi.string(),
    family: joi.objectId(),
    byReceiptDate: joi.boolean(),
    limit: joi.number(),
    skip: joi.number(),
    search: joi.string(),
    receiptId: joi.objectId(),
    deleted: joi.boolean()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.exportReceiptsToCsvSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    user: joi.objectId(),
    status: joi.string().allow(['Pending', 'Accepted', 'Processing', 'Rejected']),
    minDate: joi.string(),
    maxDate: joi.string(),
    family: joi.objectId(),
    byReceiptDate: joi.boolean(),
    search: joi.object()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.createTransferTransactionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    user: joi.objectId().required(),
    account_title: joi.string().required(),
    bank_name: joi.string().required(),
    swift_code: joi.string().required(),
    iban_no: joi.string().required(),
    amount: joi.number().required(),
    comment: joi.string().allow([''])
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.approveTransactionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    status: joi.string().valid(['Completed']).required(),
    transactionId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteTransactionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    transactionId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getAllTransactionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    user: joi.objectId(),
    status: joi.string().allow(['Pending', 'Completed']),
    dType: joi.objectId().valid(['transfer', 'recharge']),
    mode: joi.string().allow(['transactions', 'summary']),
    skip: joi.number(),
    limit: joi.number(),
    search: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getWalletByUserIdSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    user: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateAmountToWalletSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    user: joi.objectId().required(),
    amount: joi.number().required(),
    walletId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
}; module.exports.addLocationSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string().required(),
    language: joi.string().allow(['en', 'gr']).required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateLocationSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string(),
    language: joi.string().allow(['en', 'gr'])
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteLocationSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    locationId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.readNotificationSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    notificationId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getAllUserNotificationsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    user: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addFAQSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    question: joi.string().required(),
    answer: joi.string().required(),
    language: joi.string().allow(['en', 'gr']).required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.editFAQSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    question: joi.string(),
    answer: joi.string(),
    faqId: joi.objectId().required(),
    language: joi.string().allow(['en', 'gr'])
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteFAQSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    faqId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addRetailerSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string().required(),
    shops: joi.array().required().allow(null),
    leaflets: joi.array()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.shopSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string().required(),
    location: joi.string().required(),
    working_days: joi.object().required(),
    _id: joi.objectId()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.workingDaysSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    monday: joi.boolean().required(),
    tuesday: joi.boolean().required(),
    wednesday: joi.boolean().required(),
    thursday: joi.boolean().required(),
    friday: joi.boolean().required(),
    saturday: joi.boolean().required(),
    sunday: joi.boolean().required(),
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateRetailerSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string(),
    shops: joi.array().required().allow(null),
    retailerId: joi.objectId().required(),
    leaflets: joi.array()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteRetailerSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    retailerId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.acceptReceiptSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    status: joi.string().valid(['Accepted']).required(),
    description: joi.string(),
    receipt_date: joi.string().required(),
    retailer_info: joi.object().required(),
    products: joi.array().required(),
    deals: joi.array().required(),
    receiptId: joi.objectId().required(),
    savedAmount: joi.number().required(),
    amountSpent: joi.number().required(),
    user: joi.objectId(),
    receipt_id: joi.string().required(),
    receipt_time: joi.string()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.acceptBulkReceiptSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    receipts: joi.array().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.bulkReceiptDealsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    deal: joi.objectId().required(),
    quantity: joi.number().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.bulkReceiptAcceptSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    url: joi.string().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.acceptReceiptProductsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    amount: joi.number().required(),
    quantity: joi.number().required(),
    category: joi.objectId().required().allow(null),
    product: joi.objectId().required().allow(null),
    barcode: joi.string().allow(['']),
    description: joi.string(),
    community: joi.objectId(),
    points: joi.number()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.acceptReceiptDealsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    quantity: joi.number().required(),
    deal: joi.objectId().required().allow(null)
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.acceptReceiptRetailerSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    retailer: joi.objectId().required(),
    shop: joi.string().required(),
    phone: joi.string()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.checkRefreshTokenSchema = rawData => {
  const schema = joi.object().keys({
    refreshToken: joi.string().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.approveReceiptSchema = rawData => {
  const schema = joi.object().keys({
    status: joi.string().valid(['Processing']).required(),
    receiptId: joi.objectId().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.rejectReceiptSchema = rawData => {
  const schema = joi.object().keys({
    status: joi.string().required().valid(['Rejected']),
    receiptId: joi.objectId().required(),
    reason: joi.string().required(),
    receipt_id: joi.string(),
    rejectionTag: joi.string()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.checkReceiptImageData = rawData => {
  const schema = joi.object().keys({
    bucket: joi.string().required(),
    key: joi.string().required(),
    rotate: joi.boolean()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getVerificationCodeSchema = rawData => {
  const schema = joi.object().keys({
    accessToken: joi.string().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.sendVerifyPhoneCodeSchema = rawData => {
  const schema = joi.object().keys({
    phoneNumber: joi.string().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.verifyPhoneCodeSchema = rawData => {
  const schema = joi.object().keys({
    phoneNumber: joi.string().required(),
    code: joi.string().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.verifyCodeSchema = rawData => {
  const schema = joi.object().keys({
    accessToken: joi.string().required(),
    code: joi.string().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.createRechargeTransactionSchema = rawData => {
  const schema = joi.object().keys({
    phoneNo: joi.string().required(),
    amount: joi.number().required(),
    accessToken: joi.string().required(),
    code: joi.string().required(),
    user: joi.objectId().required(),
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.notifySuccessfulPaymentSchema = rawData => {
  const schema = joi.object().keys({
    payment: joi.array().required(),
    month: joi.number(),
    year: joi.number()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.notifySuccessfulPaymentArraySchema = rawData => {
  const schema = joi.object().keys({
    familyAdmin: joi.objectId().required(),
    wallet: joi.objectId().required(),
    amount: joi.number().required(),
    bank_name: joi.string().required(),
    account_title: joi.string().required(),
    iban_no: joi.string().required(),
    swift_code: joi.string().required(),
    is_donating: joi.boolean()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.notifySuccessfulPaymentFromCSVSchema = rawData => {
  const schema = joi.object().keys({
    family: joi.objectId().required(),
    wallet: joi.objectId().required(),
    amount: joi.number().required(),
    familyAdmin: joi.string().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.askQuestionSchema = rawData => {
  const schema = joi.object().keys({
    question: joi.string().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.queryScannGetSupportSchema = rawData => {
  const schema = joi.object().keys({
    name: joi.string().required(),
    subject: joi.string().required(),
    comment: joi.string().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateSettingSchema = rawData => {
  const schema = joi.object().keys({
    inviteAcceptorBonus: joi.number(),
    inviteCreatorBonus: joi.number(),
    termsAndConditions: joi.string(),
    redeemDate: joi.date(),
    appVersion: joi.string(),
    buildVersion: joi.string(),
    pointsPerEuro: joi.number(),
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getTodayFlashDealSchema = rawData => {
  const schema = joi.object().keys({
    date: joi.date().required(),
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getSimilarDealsSchema = rawData => {
  const schema = joi.object().keys({
    deal: joi.objectId().required(),
    category: joi.objectId().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteRetailerShopSchema = rawData => {
  const schema = joi.object().keys({
    retailerId: joi.objectId().required(),
    shop: joi.string().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getDealsRealtedToProductsSchema = rawData => {
  const schema = joi.object().keys({
    product: joi.objectId().required(),
    quantity: joi.number().required()
  });
  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addAdminSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    username: joi.string().required(),
    email: joi.string().regex(/^([\w]+[^"(),:;<>@[\]]+@([\w-]+\.)+[\w-]+)?$/).required(),
    phone: joi.string().required(),
    gender: joi.string().required(),
    password: joi.string().required(),
    location: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
}; module.exports.viewedIntroSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    userId: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
}; module.exports.updateFamilyAdminSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    familyId: joi.objectId().required(),
    newAdmin: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.leaveFamilySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    familyId: joi.objectId().required(),
    user: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.createNotificationSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    notificationType: joi.string().required().valid(['Winner Info', 'Promo-Deals', 'Custom', 'Info']),
    user: joi.array(),
    sendToAllUsers: joi.boolean().required(),
    description: joi.string().required(),
    meta: joi.object(),
    pushNotification: joi.boolean()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.createBulkNotificationSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    notificationData: joi.array().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.createBulkNotificationItemSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    notificationType: joi.string().required().valid(['Winner Info', 'Promo-Deals', 'Custom', 'Info']),
    user: joi.objectId().required(),
    description: joi.string().required(),
    meta: joi.object(),
    pushNotification: joi.boolean()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.rewardBonusBasicSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    rewards: joi.array().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.rewardBonusSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    user: joi.objectId(),
    notificationType: joi.string().required().valid(['Winner Info', 'Custom']),
    description: joi.string().required(),
    amount: joi.number()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getAllUserNotificationsAdminSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    user: joi.objectId(),
    notificationType: joi.string(),
    skip: joi.number(),
    limit: joi.number(),
    search: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateFamilySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string(),
    familyAdmin: joi.objectId(),
    familyMembers: joi.array(),
    familyId: joi.objectId(),
    accountDetails: joi.object()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addShoppinglistSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string().required(),
    user: joi.objectId().required(),
    family: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateShoppinglistSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string(),
    shoppinglistId: joi.objectId().required(),
    products: joi.array().required(),
    family: joi.objectId().required(),
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteShoppinglistSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    shoppinglistId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getAllShoppinglistSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    family: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getUsersFavoriteDealsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    userId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.registerPushNotificationDeviceSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    deviceId: joi.string().required(),
    userId: joi.string().required(),
    deviceInfo: joi.object()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.uploadImageToS3Schema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    imageData: joi.string().required(),
    bucket: joi.string().required(),
    contentEncoding: joi.string().required(),
    contentType: joi.string().required(),
    key: joi.string().required(),
    rotate: joi.boolean(),
    thumbnailKey: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCommunityPointsToUserFromCSVSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    pointsData: joi.array().required(),
    source: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addBrandItemsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    position: joi.number().required(),
    images: joi.array().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateBrandSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    position: joi.number().required(),
    images: joi.array().required(),
    brandId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteBrandSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    brandId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addDonationItemsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    title: joi.string().required(),
    thumbnail: joi.string().required(),
    account_title: joi.string().required(),
    bank_name: joi.string().required(),
    iban_no: joi.string().required(),
    swift_code: joi.string().required(),
    description: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateDonationSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    donationId: joi.objectId().required(),
    title: joi.string(),
    thumbnail: joi.string(),
    account_title: joi.string(),
    bank_name: joi.string(),
    iban_no: joi.string(),
    swift_code: joi.string(),
    description: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteDonationSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    donationId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addSectorItemsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string().required(),
    categories: joi.array().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateSectorSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    sectorId: joi.objectId().required(),
    name: joi.string(),
    categories: joi.array()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteSectorSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    sectorId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.createCommunitySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string().required(),
    client: joi.objectId().required(),
    permissions: joi.array(),
    images: joi.array(),
    weight: joi.number(),
    pointsPerEuro: joi.number()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateCommunitySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string(),
    client: joi.objectId(),
    communityId: joi.objectId().required(),
    permissions: joi.array(),
    images: joi.array(),
    weight: joi.number(),
    pointsPerEuro: joi.number().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteCommunitySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.approveCommunitySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCommunityProductSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    title: joi.string().required(),
    description: joi.string().allow([null, '']),
    nutritionInfo: joi.object().allow(null),
    healthInfo: joi.string().allow(['']),
    barcode: joi.string().allow(['']),
    points: joi.number(),
    variations: joi.array(),
    images: joi.array(),
    community: joi.objectId().required(),
    client: joi.objectId().required(),
    weight: joi.number()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateCommunityProductSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    title: joi.string(),
    description: joi.string(),
    nutritionInfo: joi.object().allow(null),
    healthInfo: joi.string().allow(['']),
    barcode: joi.string().allow(['']),
    variations: joi.array(),
    points: joi.number(),
    images: joi.array(),
    community: joi.objectId(),
    client: joi.objectId(),
    communityProductId: joi.objectId().required(),
    weight: joi.number()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteCommunityProductSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityProductId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
}; module.exports.approveCommunityProductsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityProductId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCommunityProductNutritionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    measuringUnit: joi.string().required(),
    nutrients: joi.array()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCommunityProductNutritionItemsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string().required(),
    amount: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCommunityEventSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    title: joi.string().required(),
    description: joi.string(),
    images: joi.array(),
    startDate: joi.date().allow(null),
    endDate: joi.date().allow(null),
    community: joi.objectId().required(),
    client: joi.objectId().required(),
    weight: joi.number()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateCommunityEventSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    title: joi.string(),
    description: joi.string(),
    images: joi.array(),
    startDate: joi.date(),
    endDate: joi.date(),
    community: joi.objectId(),
    client: joi.objectId(),
    communityEventId: joi.objectId().required(),
    weight: joi.number()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteCommunityEventSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityEventId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
}; module.exports.approveCommunityEventsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityEventId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCommunityRecipeSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    title: joi.string().required(),
    description: joi.string(),
    images: joi.array(),
    ingredients: joi.array(),
    community: joi.objectId().required(),
    client: joi.objectId().required(),
    weight: joi.number()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCommunityRecipeIngredientsItemsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    name: joi.string().required(),
    amount: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateCommunityRecipeSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    title: joi.string(),
    description: joi.string(),
    images: joi.array(),
    community: joi.objectId(),
    client: joi.objectId(),
    ingredients: joi.array(),
    communityRecipeId: joi.objectId().required(),
    weight: joi.number()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteCommunityRecipeSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityRecipeId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
}; module.exports.approveCommunityRecipesSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityRecipeId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCommunityValueSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    title: joi.string(),
    description: joi.string(),
    community: joi.objectId().required(),
    client: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateCommunityValueSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    title: joi.string(),
    description: joi.string(),
    community: joi.objectId(),
    client: joi.objectId(),
    communityValueId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteCommunityValueSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityValueId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.approveCommunityValuesSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityValueId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCommunityHistorySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    description: joi.string().required(),
    community: joi.objectId().required(),
    client: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateCommunityHistorySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    description: joi.string(),
    community: joi.objectId(),
    client: joi.objectId(),
    communityHistoryId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteCommunityHistorySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityHistoryId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.approveCommunityHistorySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityHistoryId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCommunityIntroductionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    description: joi.string().required(),
    community: joi.objectId().required(),
    client: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateCommunityIntroductionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    description: joi.string(),
    community: joi.objectId(),
    client: joi.objectId(),
    communityIntroductionId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteCommunityIntroductionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityIntroductionId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.approveCommunityIntroductionSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityIntroductionId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.communityIdValidationSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addCommunityPeopleSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    people: joi.array(),
    description: joi.string().allow(['', null]),
    community: joi.objectId().required(),
    client: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateCommunityPeopleSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    people: joi.array(),
    description: joi.string().allow(['', null]),
    community: joi.objectId(),
    client: joi.objectId(),
    communityPeopleId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteCommunityPeopleSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityPeopleId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.approveCommunityPeopleSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communityPeopleId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getCommunityByShortIdSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    communitySid: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.overallStatusSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    dateFilter: joi.string().required().valid(['weekly', 'monthly'])
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getDashboardDatav1Schema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    period: joi.string().required(),
    deal: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getDashboardDatav2Schema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    lastPeriods: joi.number().required(),
    deal: joi.string().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getUsersRegistrationTrendSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    minDate: joi.date(),
    maxDate: joi.date()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getAllCommunityPointsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    family: joi.objectId()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getAllCommunityPointsByFamilyIdSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    family: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.manualCommunityPointsEntrySchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    family: joi.objectId().required(),
    source: joi.string().required(),
    points: joi.number().required(),
    info: joi.string(),
    community: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.redeemCommunityPointsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    redeemInfo: joi.array(),
    community: joi.objectId().required(),
    month: joi.number().required(),
    info: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.redeemCommunityPointsItemsSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    points: joi.number().required(),
    family: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.addFlashPromoSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    startDate: joi.date().required(),
    endDate: joi.date().required(),
    markdown: joi.string().required(),
    meta: joi.object()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.updateFlashPromoSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    startDate: joi.date().required(),
    endDate: joi.date().required(),
    markdown: joi.string().required(),
    meta: joi.object(),
    flashPromoId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.deleteFlashPromoSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    flashPromoId: joi.objectId().required()
  });

  return getPlainError(joi.validate(rawData, schema));
};

module.exports.getPresignedUrlSchema = (rawData) => { // eslint-disable-line
  const schema = joi.object().keys({
    key: joi.string().required(),
    thumbnailKey: joi.string()
  });

  return getPlainError(joi.validate(rawData, schema));
};
