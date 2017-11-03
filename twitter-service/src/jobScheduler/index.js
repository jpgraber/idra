const CronJob   = require('cron').CronJob

const connect = container => {
  const { repositories, services } = container.cradle
  const { setupJob, jobRunner } = container.resolve('workers')
  const { twitterJobRepository } = repositories

  function scheduleJob(twitterJob) {
    const startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() + 1);

    function onJobFinished(err) {
      console.log('we are freaking finished!!', err)
    }

    async function onJobStart(cb) {
      if (twitterJob.status === 'pending') {
        twitterJob = await setupJob(twitterJob)
      }
      try {
        await jobRunner(twitterJob)
        cb()
      } catch(err) {
        cb(err)
      }
    }

    return new CronJob(
      startTime,
      onJobStart,
      onJobFinished,
      true,
      'America/Los_Angeles'
    );
  }

  function rebootRunningJobs() {
    twitterJobRepository.getPendingOrInProgressJobs()
      .then(resp => {
        resp.forEach(cur => scheduleJob(cur))
      })
      .catch(e => {
        console.log(e)
      })
  }


  return new Promise(resolve => {
    const jobScheduler = Object.assign({
      scheduleJob,
      rebootRunningJobs
    })
    container.registerValue({jobScheduler})
    resolve(container)
  })
}

module.exports = connect
