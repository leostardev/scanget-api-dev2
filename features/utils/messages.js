const userMessages = require('../user/user-messages');
const authMessages = require('../authentication/authentication-messages');
const categoryMessages = require('../category/category-messages');
const productMessages = require('../product/product-messages');
const dealMessages = require('../deal/deal-messages');
const inviteMessages = require('../invite/invite-messages');
const promotionMessages = require('../promotion/promotion-messages');
const favoriteMessages = require('../favorite/favorite-messages');
const receiptMessages = require('../receipt/receipt-messages');
const transactionMessages = require('../transaction/transaction-messages');
const walletMessages = require('../wallet/wallet-messages');
const locationMessages = require('../location/location-messages');
const brandMessages = require('../brand/brand-messages');
const notifcationMessages = require('../notification/notification-messages');
const faqMessages = require('../faq/faq-messages');
const retailerMessages = require('../retailer/retailer-messages');
const familyMessages = require('../family/family-messages');
const shoppinglist = require('../shoppinglist/shoppinglist-messages');
const clientMessages = require('../client/client-messages');
const packageMessages = require('../package/package-messages');
const periodMessages = require('../period/period-messages');
const clientPackageMessages = require('../client-package/client-package-messages');
const communityMessages = require('../community/community-messages');
const communityProductsMessages = require('../community-product/community-product-messages');
const communityRecipesMessages = require('../community-recipe/community-recipe-messages');
const communityEventsMessages = require('../community-event/community-event-messages');
const communityValuesMessages = require('../community-value/community-value-messages');
const communityHistoryMessages = require('../community-history/community-history-messages');
const communityPeopleMessages = require('../community-people/community-people-messages');
const donationMessages = require('../donation/donation-messages');
const sectorMessages = require('../sector/sector-messages');
const communityPointsMessages = require('../community-points/community-points-messages');
const flashPromo = require('../flash-promo/flash-promo-messages');
const walletTransactions = require('../wallet-transaction/wallet-transaction-messages');

module.exports = {
  USER: userMessages,
  AUTH: authMessages,
  product: productMessages,
  category: categoryMessages,
  deal: dealMessages,
  invite: inviteMessages,
  promotion: promotionMessages,
  favorite: favoriteMessages,
  receipt: receiptMessages,
  transaction: transactionMessages,
  wallet: walletMessages,
  location: locationMessages,
  notification: notifcationMessages,
  retailer: retailerMessages,
  faq: faqMessages,
  family: familyMessages,
  shoppinglist,
  client: clientMessages,
  package: packageMessages,
  period: periodMessages,
  clientPackage: clientPackageMessages,
  brand: brandMessages,
  community: communityMessages,
  communityProduct: communityProductsMessages,
  communityRecipe: communityRecipesMessages,
  communityEvent: communityEventsMessages,
  communityValue: communityValuesMessages,
  communityHistory: communityHistoryMessages,
  communityPeople: communityPeopleMessages,
  donation: donationMessages,
  sector: sectorMessages,
  communityPoints: communityPointsMessages,
  flashPromo,
  walletTransactions,
  SERVER: {
    ERROR_UNAUTHORIZED: 'You are not authorized to perform this operation.',
    ERROR_GETTING_MONGO_USER: 'Something went wrong while fetching mongoDB user.',
  }
};
