const Boom = require('boom');
const moment = require('moment');
const periodDb = require('./period-model');  // eslint-disable-line
const responseMessages = require('../utils/messages');

module.exports.generatePeriods = async ({ year }) => {
  try {
    // get current year periods
    // if exists generate error, else create new ones
    const currentPeriodCountRequestedYear = await periodDb.getYearPeriodCount(year);
    if (currentPeriodCountRequestedYear > 0) {
      throw Boom.forbidden('Already Period exists for the given yyear');
    } else {
      const periods = [];
      // const yearStartDate = moment(new Date(`${year}-01-03`)).startOf('day').toDate();
      let startDate = moment(new Date(`${year}-01-03`)).utc().startOf('day').toDate();
      const yearEndDate = moment(new Date(`${year}-12-31`)).utc().endOf('day').toDate();
      let endDate = moment(startDate).add(6, 'days').utc().endOf('day').toDate();
      console.log(moment(yearEndDate).diff(moment(endDate), 'days'));
      let weeKNo = 0;
      while (moment(yearEndDate).diff(moment(endDate), 'days') > 6) {
        weeKNo++;
        endDate = moment(startDate).add(6, 'days').utc().endOf('day').toDate();
        periods.push({
          endDate,
          startDate,
          month: moment(startDate, 'YYYY/MM/DD').format('MMMM'),
          month_no: moment(startDate, 'YYYY/MM/DD').format('M'),
          year,
          description: `Week ${weeKNo} ${year}`
        });
        startDate = moment(endDate).add(1, 'days').utc().startOf('day').toDate();
      }
      // add 52th week
      weeKNo++;
      endDate = moment(startDate).add(6, 'days').utc().endOf('day').toDate();
      periods.push({
        endDate,
        startDate,
        month: moment(startDate, 'YYYY/MM/DD').format('MMMM'),
        month_no: moment(startDate, 'YYYY/MM/DD').format('M'),
        year,
        description: `Week ${weeKNo} ${year}`
      });
      const newPeriod = await periodDb.generatePeriods(periods);
      return newPeriod;
    }
  } catch (err) {
    throw Boom.internal(responseMessages.period.ERROR_GENERATE_PERIODS, err);
  }
}

module.exports.getAllPeriods = async (query) => {
  try {
    const allPeriodsData = await periodDb.getAllPeriods(query);
    return allPeriodsData;
  } catch (err) {
    throw Boom.internal(responseMessages.period.ERROR_GET_ALL_PERIOD, err);
  }
}

module.exports.getAllAvailablePeriods = async (query) => {
  try {
    const allAvailablePeriodsData = await periodDb.getAllPeriods(query);
    return allAvailablePeriodsData;
  } catch (err) {
    throw Boom.internal(responseMessages.period.ERROR_GET_ALL_PERIOD, err);
  }
}

module.exports.updatePeriodData = async (periodId, updateData) => {
  try {
    const updatedPeriod = await periodDb.updatePeriodData(periodId, updateData);
    return updatedPeriod;
  } catch (err) {
    throw Boom.internal(responseMessages.period.ERROR_GET_ALL_PERIOD, err);
  }
}

module.exports.revertPEriodDaysBy1Day = async (year, days) => {
  try {
    const query = {
      year: parseInt(year, 10)
    };
    let allPeriods = await periodDb.getAllPeriods(query);
    allPeriods = allPeriods.map((period) => { // eslint-disable-line 
      return {
        ...period,
        startDate: moment(period.startDate).subtract(days, 'days').toDate(),
        endDate: moment(period.endDate).subtract(days, 'days').toDate(),
      };
    });
    const $promises = [];
    for (let i = 0; i < allPeriods.length; i++) {
      $promises.push(periodDb.updatePeriodData(allPeriods[i]._id, { startDate: allPeriods[i].startDate, endDate: allPeriods[i].endDate }));
    }
    const updatedData = await Promise.all($promises);
    return updatedData;
  } catch (err) {
    throw Boom.internal(responseMessages.period.ERROR_GET_ALL_PERIOD, err);
  }
}
