const TwitterCredentialFactory = require('../factories/twitterCredentialFactory');
const TwitterCredentialModel   = require('../models/twitterCredentialModel');

const createTwitterCredential = (data = {}, cb) => {
  const fields = TwitterCredentialFactory.scrubTwitterCredentialData(data);
  if (!TwitterCredentialFactory.validateTwitterCredentialFields(fields)){
    return cb('missing required twitter credential data');
  }

  const newModel = TwitterCredentialFactory.buildTwitterCredentialModel(fields);
  newModel.save(cb);
}

const updateTwitterCredential = (data = {}, cb) => {
  const fields = TwitterCredentialFactory.scrubTwitterCredentialData(data);
  if (!TwitterCredentialFactory.validateTwitterCredentialFields(fields)){
    return cb('missing required twitter credential data');
  }
  const updatedModel = TwitterCredentialFactory.buildTwitterCredentialModel(fields);
  const $query = { teamId: fields.teamId };
  const $update = { $set: updatedModel.persistProps };
  const $opts = { upsert: true };
  TwitterCredentialModel.update($query, $update, $opts, err => cb(err));
}

function getTwitterCredential(teamId, cb) {
  if (!teamId) return cb('missing required team id');
  TwitterCredentialModel.findOne({teamId: teamId}, (err, twitterCredentialModel) => {
    if (err) return cb(err);
    return twitterCredentialModel ? cb(err, twitterCredentialModel.clientProps) : cb(err, undefined);
  });
}

module.exports = {
  getTwitterCredential,
  updateTwitterCredential,
  createTwitterCredential
}