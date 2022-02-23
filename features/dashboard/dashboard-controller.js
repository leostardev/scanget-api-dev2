const Boom = require('boom');
const userDB = require('../user/user-model');
const receiptDB = require('../receipt/receipt-model');
const periodDB = require('../period/period-model');

module.exports.getOverallStatus = async (body) => {
  try {
    // dateFilter: joi.string.required().valid(['weekly', 'monthly'])
    const dateFilter = body.dateFilter;
    let periods = [];
    const responseData = [];

    if (dateFilter === 'weekly') {
      periods = await periodDB.getLastSpecificPeriods(12);
    } else {
      periods = await periodDB.getLastSpecificPeriods(52);
    }
    const $init_promises = [
      userDB.getTotalUsersStartingCount(periods[0].startDate),
      userDB.getTotalFamiliesStartingCount(periods[0].startDate),
      receiptDB.getTotalReceiptsCountBelowSpecificDate(periods[0].startDate),
      receiptDB.getTotalReceiptsCountBelowSpecificDate(periods[0].startDate, 'Accepted'),
      receiptDB.getReceiptsTotalSaleBelowSpecificDate(periods[0].startDate),
      receiptDB.getReceiptsTotalSavingsBelowSpecificDate(periods[0].startDate)
    ];
    const init_data = await Promise.all($init_promises);
    let totalUsers = init_data[0];
    let totalFamilies = init_data[1];
    let totalReceipts = init_data[2];
    let totalValidReceipts = init_data[3];
    let totalSales = init_data[4];
    let totalSavings = init_data[5];
    periods = periods.reverse();

    for (let i = 0; i < periods.length; i++) {
      const $promises = [];
      const filterData = {
        minDate: periods[i].startDate,
        maxDate: periods[i].endDate
      };
      $promises.push(userDB.getTotalUsersCount(filterData));
      $promises.push(userDB.getActiveUsersCount(filterData));
      $promises.push(userDB.getTotalFamiliesCount(filterData));
      $promises.push(userDB.getActiveFamiliesCount(filterData));
      $promises.push(receiptDB.getTotalReceiptsCount(filterData));
      // $promises.push(receiptDB.getReceiptDealsCount(filterData));
      $promises.push(receiptDB.getReceiptsTotalSale(filterData));
      $promises.push(receiptDB.getTotalReceiptsCount(filterData, 'Accepted'));
      $promises.push(receiptDB.getReceiptsTotalSavings(filterData));
      $promises.push(receiptDB.getAverageShopsCount(filterData));
      const counts = await Promise.all($promises);
      totalUsers += counts[0];
      totalFamilies += counts[2];
      totalReceipts += counts[4];
      totalValidReceipts += counts[6];
      totalSales += counts[5];
      totalSavings += counts[7];
      responseData.push({
        period: periods[i].description,
        startDate: periods[i].startDate,
        endDate: periods[i].endDate,
        totalUsers,
        totalFamilies,
        totalNewUsers: counts[0],
        totalNewFamilies: counts[2],
        activeUsers: counts[1],
        activeFamilies: counts[3],
        totalReceipts,
        totalValidReceipts,
        // quantitySold: counts[5],
        totalSales,
        totalSavings,
        averageShops: counts[8]
      });
    }
    return responseData;
  } catch (error) {
    throw Boom.forbidden('Something went wrong while getting dashboard overall status', error);
  }
}

module.exports.getDashboardDatav1 = async (body) => {
  try {
    const query = {};
    if (body.period !== 'all') {
      const period = await periodDB.getPeriodById(body.period);
      if (period) {
        query.minDate = period.startDate;
        query.maxDate = period.endDate;
      }
    }
    if (body.deal !== 'all') {
      query.deal = body.deal;
    }
    const responseData = {};
    const $promises = [
      userDB.getTotalUsersCount(query),
      userDB.getTotalFamiliesCount(query),
      receiptDB.getUsersCountWhoUploadedAtLeastAReceipt(query),
      receiptDB.getFamiliesCountWhoUploadedAtLeastAReceipt(query),
      receiptDB.getTotalReceiptsCount(query),
    ];
    const countData = await Promise.all($promises);
    responseData.totalUsers = countData[0];
    responseData.totalFamilies = countData[1];
    responseData.activeUsers = countData[2];
    responseData.activeFamilies = countData[3];
    responseData.totalReceipts = countData[4];

    const $detailedDataPromises = [
      receiptDB.getTotalReceiptsCountGroupedByDates(query)
    ];
    responseData.detailedData = await Promise.all($detailedDataPromises);
    return responseData;
  } catch (error) {
    throw Boom.forbidden('Something went wrong while getting dashboard 1 data', error);
  }
}

module.exports.getDashboardDatav2 = async (body) => {
  try {
    let periods = await periodDB.getLastSpecificPeriods(parseInt(body.lastPeriods, 10));
    const query = {
      minDate: periods[periods.length - 1].startDate,
      maxDate: periods[0].endDate
    };
    if (body.deal !== 'all') {
      query.deals = body.deal;
    }
    const $summaryDataPromises = [
      receiptDB.getTotalUsersWrtDeal(query),
      receiptDB.getTotalFamiliesWrtDeal(query),
      receiptDB.getProductsQuantity(query),
      receiptDB.getReceiptsTotalSale(query),
      userDB.getTotalUsersCount(query),
      userDB.getTotalFamiliesCount(query),
      receiptDB.getUsersCountWhoUploadedAtLeastAReceipt(query),
      receiptDB.getFamiliesCountWhoUploadedAtLeastAReceipt(query)
    ];
    const summaryData = await Promise.all($summaryDataPromises);

    const detailedData = [];
    const responseData = {};
    const $init_promises = [
      userDB.getTotalUsersStartingCount(periods[0].startDate),
      userDB.getTotalFamiliesStartingCount(periods[0].startDate),
      receiptDB.getTotalReceiptsCountBelowSpecificDate(periods[0].startDate),
      receiptDB.getTotalReceiptsCountBelowSpecificDate(periods[0].startDate, 'Accepted'),
      // receiptDB.getReceiptsTotalSaleBelowSpecificDate(periods[0].startDate),
      receiptDB.getReceiptsTotalSavingsBelowSpecificDate(periods[0].startDate),
      // receiptDB.getTotal
    ];
    const init_data = await Promise.all($init_promises);
    let totalUsers = init_data[0];
    let totalFamilies = init_data[1];
    let totalReceipts = init_data[2];
    let totalValidReceipts = init_data[3];
    // let totalSales = init_data[4];
    let totalSavings = init_data[4];
    periods = periods.reverse();

    for (let i = 0; i < periods.length; i++) {
      const $promises = [];
      const filterData = {
        minDate: periods[i].startDate,
        maxDate: periods[i].endDate
      };
      if (body.deal && body.deal !== 'all') {
        filterData.deals = body.deal;
      }
      $promises.push(userDB.getTotalUsersCount(filterData));
      $promises.push(receiptDB.getUsersCountWhoUploadedAtLeastAReceipt(filterData));
      $promises.push(userDB.getTotalFamiliesCount(filterData));
      $promises.push(receiptDB.getFamiliesCountWhoUploadedAtLeastAReceipt(filterData));
      $promises.push(receiptDB.getTotalReceiptsCount(filterData));
      // $promises.push(receiptDB.getReceiptDealsCount(filterData));
      // $promises.push(receiptDB.getReceiptsTotalSale(filterData));
      $promises.push(receiptDB.getTotalReceiptsCount(filterData, 'Accepted'));
      $promises.push(receiptDB.getProductsQuantity(filterData));
      $promises.push(receiptDB.getReceiptsTotalSavings(filterData));
      const counts = await Promise.all($promises);
      totalUsers += counts[0];
      totalFamilies += counts[2];
      totalReceipts += counts[4];
      totalValidReceipts += counts[5];
      // totalSales += counts[5];
      totalSavings += counts[7];
      detailedData.push({
        period: periods[i].description,
        startDate: periods[i].startDate,
        endDate: periods[i].endDate,
        totalUsers,
        totalFamilies,
        totalNewUsers: counts[0],
        totalNewFamilies: counts[2],
        activeUsers: counts[1],
        activeFamilies: counts[3],
        totalReceipts,
        totalValidReceipts,
        quantity: counts[6],
        // totalSales,
        totalSavings
        // averageShops: counts[8]
      });
    }
    responseData.totalUsers = summaryData[4];
    responseData.totalFamilies = summaryData[5];
    responseData.totalActiveUsers = summaryData[6];
    responseData.totalActiveFamilies = summaryData[7];
    responseData.usersBoughtSpecificDeal = summaryData[0];
    responseData.familiesBoughtSpecificDeal = summaryData[1];
    responseData.totalQuantity = summaryData[2];
    responseData.totalSales = summaryData[3];
    responseData.detailedData = detailedData;
    return responseData;
  } catch (error) {
    throw Boom.forbidden('Something went wrong while getting dashboard 2 data', error);
  }
}
// module.exports.getUsersRegistrationTrend(body) {
//   const userRegisterTrend = await userDB.userRegisterationTrend(body);
//   return userRegisterTrend;
// }
