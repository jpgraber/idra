const AuthClient  = require("../../common/auth-token");
const async       = require('async');
const user        = require('../../models/user.model');
const SocketStore = require('../socket-store');
const ioEvents    = require('../io-events');

const onJoinRoom = (params={}) => {
  const { room, teamId, socket, authToken } = params;
  if (!room || !teamId || !socket || !authToken) return;
  if (room !== 'ADMIN_TEAM_PROFILE') return; 
  
  AuthClient.verifyTokenAndReturnUser(authToken, (err, userModel) => {
    if (err) return;
    if (!userModel || !userModel.isAdmin) { return; }
    const opts = { userModel, teamId };
    SocketStore.joinRoom(room, opts);
  });
}

const onTwitterIntegrationUpdate = twitterIntegrationModel => {
  if (!twitterIntegrationModel) return;

  const roomConnections = SocketStore.getConnectedRoomSockets('ADMIN_TEAM_PROFILE');
  if (!roomConnections) return;

  const payload = { 
    action: 'TWITTER_INTEGRATION_UPDATE',
    data: twitterIntegrationModel.clientProps
  };
  roomSocks.forEach(cur => writeToSocket(cur, ioEvents.notifyRoom, payload));
}

const config = socketEmitter => {
  socketEmitter.on(ioEvents.joinRoom, onJoinRoom);
  socketEmitter.on(ioEvents.twitterIntegrationUpdate, onTwitterIntegrationUpdate);
}

module.exports = {
  config
};