const LocationSchema = require('./location-schema');

module.exports.addLocation = (locationData) => {
  const location = new LocationSchema(locationData);
  return new Promise((resolve, reject) => {
    location.save((err, createdLocation) => {
      if (err) {
        reject(err);
      }
      resolve(createdLocation);
    });
  });
}

module.exports.updateLocation = (updateLocationData, locationId) => {
  return new Promise((resolve, reject) => {
    LocationSchema.findOneAndUpdate({ _id: locationId }, updateLocationData, { new: true }, (err, updatedLocation) => {
      if (err) {
        reject(err);
      }
      resolve(updatedLocation);
    });
  });
}

module.exports.deleteLocation = (locationId) => {
  return new Promise((resolve, reject) => {
    LocationSchema.findById(locationId, (err, location) => {
      if (err) {
        reject(err);
      }
      const updateData = {
        name: `${location.name}-deleted`,
        active: false
      };
      LocationSchema.findOneAndUpdate({ _id: locationId }, updateData, { new: true }, (err2) => {
        if (err2) {
          reject(err2);
        }
        resolve({});
      });
    });
  });
}

module.exports.getAllLocations = (query) => {
  return new Promise((resolve, reject) => {
    LocationSchema.find({ ...query, active: true }, (err, allLocations) => {
      if (err) {
        reject(err);
      }
      resolve(allLocations);
    });
  });
}

module.exports.getLocationByName = (name) => {
  return new Promise((resolve, reject) => {
    LocationSchema.find({ name, active: true }, (err, allLocations) => {
      if (err) {
        reject(err);
      }
      resolve(allLocations);
    });
  });
}
