const encrypt = require('../helpers/encrypt')

const dbSettings = {
  db: process.env.DB_NAME,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  repl: process.env.DB_REPLS || 'rs1',
  server: process.env.DB_SERVER,
  dbParameters: () => ({
    w: 'majority',
    wtimeout: 10000,
    j: true,
    readPreference: 'ReadPreference.SECONDARY_PREFERRED',
    native_parser: false
  }),
  serverParameters: () => ({
    autoReconnect: true,
    poolSize: 10,
    socketoptions: {
      keepAlive: 300,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000
    }
  }),
  replsetParameters: (replset = 'rs1') => ({
    replicaSet: replset,
    ha: true,
    haInterval: 10000,
    poolSize: 10,
    socketoptions: {
    keepAlive: 300,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000
    }
  }),
  collections: {
    'services': {}
  },
}

const serviceEndpoints = {
  serviceRegistry: `http://${process.env.SERVICE_REGISTRY_CONTAINER_NAME}:${process.env.SERVICE_REGISTRY_CONTAINER_PORT}`,
  usersService: `http://${process.env.USERS_CONTAINER_NAME}:${process.env.USERS_CONTAINER_PORT}`
}

const encryptedAccessSecret = encrypt(process.env.ACCESS_SECRET)

const serverSettings = {
  port: process.env.CONTAINER_PORT
}

module.exports = Object.assign({}, { dbSettings, serverSettings, serviceEndpoints, encryptedAccessSecret })
