const TwitterCredential = require('../models/twitterCredentialModel');
const cryptoClient = require('../common/crypto');

function validateTwitterCredentialFields(fields) {
  if (!fields || typeof fields !== 'object') return false;
  if (!fields.consumer_key ||
      !fields.consumer_secret ||
      !fields.access_token_key ||
      !fields.access_token_secret ||
      !fields.teamId
     ) { return false; }
  return true;
}

function scrubTwitterCredentialData(data) {
  if (!data || typeof data !== 'object') return {};
  const { access_token_secret, access_token_key, consumer_secret, consumer_key, teamId } = data;
  return {
    access_token_secret,
    access_token_key,
    consumer_secret,
    consumer_key,
    teamId
  };
}

function buildTwitterCredentialModel(fields) {
  const { consumer_secret, consumer_key, access_token_key, access_token_secret, teamId } = fields;
  
  const props = {
    consumer_key: cryptoClient.encrypt(consumer_key),
    consumer_secret: cryptoClient.encrypt(consumer_secret),
    access_token_key: cryptoClient.encrypt(access_token_key),
    access_token_secret: cryptoClient.encrypt(access_token_secret),
    teamId
  };

  return new TwitterCredential(props);
}

module.exports = {
  buildTwitterCredentialModel,
  scrubTwitterCredentialData,
  validateTwitterCredentialFields
};