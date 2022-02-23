const PeriodSchema = require('./period-schema');

module.exports.generatePeriods = (periodData) => {
  return new Promise((resolve, reject) => {
    PeriodSchema.insertMany(periodData, (err, newPeriod) => {
      if (err) {
        reject(err);
      }
      resolve(newPeriod);
    });
  });
}

module.exports.getAllPeriods = (query) => {
  return new Promise((resolve, reject) => {
    PeriodSchema.find(query).sort({ startDate: 1 }).lean().exec((err, periods) => {
      if (err) {
        reject(err);
      }
      resolve(periods);
    });
  });
}

module.exports.getYearPeriodCount = (year) => {
  return new Promise((resolve, reject) => {
    PeriodSchema.count({ year }, (err, count) => {
      if (err) {
        reject(err);
      }
      resolve(count);
    });
  });
}

module.exports.updatePeriodData = (periodId, updateData) => {
  return new Promise((resolve, reject) => {
    PeriodSchema.findByIdAndUpdate(periodId, updateData, { new: true }, (err, updatedPeriod) => {
      if (err) {
        reject(err);
      }
      resolve(updatedPeriod);
    });
  });
}

module.exports.getCurrentPeriod = () => {
  const currentDate = new Date();
  return new Promise((resolve, reject) => {
    PeriodSchema.findOne({
      startDate: {
        $lte: currentDate
      },
      endDate: {
        $gte: currentDate
      }
    }, (err, period) => {
      if (err) {
        reject(err);
      }
      resolve(period);
    });
  });
}

module.exports.getPeriodById = (periodId) => {
  return new Promise((resolve, reject) => {
    PeriodSchema.findById(periodId, (err, periods) => {
      if (err) {
        reject(err);
      }
      resolve(periods);
    });
  });
}

module.exports.getPeriodsByIds = (periodIds) => {
  return new Promise((resolve, reject) => {
    PeriodSchema.find({ _id: { $in: periodIds } }, (err, periods) => {
      if (err) {
        reject(err);
      }
      resolve(periods);
    });
  });
}

module.exports.getLastSpecificPeriods = (lastPeriodsCount) => {
  return new Promise((resolve, reject) => {
    PeriodSchema.find({ startDate: { $lte: new Date() } }).sort({ startDate: -1 }).exec((err, periods) => {
      if (err) {
        reject(err);
      }
      resolve(periods.slice(0, lastPeriodsCount));
    });
  });
}
