const async       = require('async');

const setupCollections = (db, options, cb) => {

  const getCollectionsNeedAdded = colList => Object.keys(options.collections).filter(cur => colList.indexOf(cur) < 0);

  db.listCollections().toArray((err, colList=[]) => {
    if (err) {
      return cb(err);
    }

    const colsNeedAdded = getCollectionsNeedAdded(colList.map(cur => cur.name));

    async.eachSeries(colsNeedAdded, (item, next) => {
      db.createCollection(item, options.collections[item], next);
    }, cb);
  });
};

module.exports = setupCollections;
