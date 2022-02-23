const SectorSchema = require('./sector-schema');

module.exports.addSector = sectorData => {
  const sector = new SectorSchema(sectorData);
  return new Promise((resolve, reject) => {
    sector.save((err, createdSector) => {
      if (err) {
        reject(err);
      }
      SectorSchema.findById(createdSector._id).populate('categories').lean().exec((err2, recentlyAddedSector) => {
        if (err2) {
          reject(err2);
        } else {
          resolve(recentlyAddedSector);
        }
      });
    });
  });
}

module.exports.updateSector = (updateSectorData, sectorId) => {
  return new Promise((resolve, reject) => {
    SectorSchema.findOneAndUpdate({ _id: sectorId }, updateSectorData, { new: true }, err => {
      if (err) {
        reject(err);
      }
      SectorSchema.findById(sectorId).populate('categories').lean().exec((err2, updatedSector) => {
        if (err2) {
          reject(err2);
        } else {
          resolve(updatedSector);
        }
      });
    });
  });
}

module.exports.deleteSector = sectorId => {
  return new Promise((resolve, reject) => {
    const updateData = {
      active: false
    };
    SectorSchema.findByIdAndUpdate(sectorId, updateData, { new: true }, err2 => {
      if (err2) {
        reject(err2);
      }
      resolve({});
    });
  });
}

module.exports.getAllSectors = noPopulate => {
  return new Promise((resolve, reject) => {
    SectorSchema.find({ active: true }).populate(noPopulate ? '' : 'categories').lean().exec((err, allSectors) => {
      if (err) {
        reject(err);
      }
      resolve(allSectors);
    });
  });
}

module.exports.getSectorByPosition = position => {
  return new Promise((resolve, reject) => {
    SectorSchema.findOne({ position, active: true }, (err, sector) => {
      if (err) {
        reject(err);
      }
      resolve(sector);
    });
  });
}

module.exports.addCategoryToSector = (sectorId, category) => {
  return new Promise((resolve, reject) => {
    SectorSchema.findByIdAndUpdate(sectorId, {
      $addToSet: {
        categories: category
      },
    }, (err, sector) => {
      if (err) {
        reject(err);
      }
      resolve(sector);
    });
  });
}
