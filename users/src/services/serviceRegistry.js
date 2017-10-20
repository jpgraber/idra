const dial = require('../libs/dial')


const serviceRegistry = container => {
  const registry = container.resolve('registry')

  const register = () => {
    const url = `http://${process.env.SERVICE_REGISTRY_CONTAINER_NAME}:${process.env.SERVICE_REGISTRY_CONTAINER_PORT}/registry`;
    const opts = { json: { service: registry } }

    dial(url, 'put', opts, (err, resp) => {
      console.log('dialed registry')
      console.log(err)
      console.log(resp)
    })
  }

  return Object.create({
    register
  })
}


module.exports = serviceRegistry;
