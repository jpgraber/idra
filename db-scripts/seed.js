const TeamFactory      = require('../factories/team.factory');
const TeamService      = require('../services/team.service');
const UserService      = require('../services/user.service');
const UserFactory      = require('../factories/user.factory');
const ReportService    = require('../services/report.service'); 
const ReportFactory    = require('../factories/report.factory');
const TwitterCredentialFactory = require('../factories/twitter-credential.factory')

const Team             = require('../models/team.model');
const User             = require('../models/user.model');
const ReportLog             = require('../models/report-log.model');
const ReportRequest         = require('../models/report-request.model'); 
const TwitterCredential    = require('../models/twitter-credential.model');
const TwitterIntegrationJob = require('../models/twitter-integration-job.model');
const async            = require('async');
const SeedData         = require('./seed-data');
const dotenv           = require('dotenv');

/**
 * Load in config file  
 */

dotenv.config();

/**
 * Init the mongo connection
 */

require('../config/mongo').config();

/**
 * remove users and teams
 */

const dropTeams = cb => Team.collection.drop(() => cb());
const dropUsers = cb => User.collection.drop(() => cb());
const dropReportLogs = cb => ReportLog.collection.drop(() => cb());
const dropReportRequests = cb => ReportRequest.collection.drop(() => cb());
const dropTwitterIntegrationJobs = cb => TwitterIntegrationJob.collection.drop(() => cb());
const dropTwitterCredentials = cb => TwitterCredential.collection.drop(() => cb());


/**
 * Load User Teams
 */
function loadUserTeams(cb) {
  async.eachSeries(SeedData.teams, function(data, eachCb) {
    const scrubbedData = TeamFactory.scrubTeamData(data);
    if (!TeamFactory.validateTeamFields(scrubbedData)) {
      throw new Error('invalid team data');  
    };
    const teamModel = TeamFactory.buildTeamModel(scrubbedData);
    teamModel.save(eachCb);
  }, cb);
}

function loadTwitterCredentials(cb) {
  TeamService.queryTeams({name: 'Innosol Pro Admin'}, function(err, teams) {
    const teamId = teams[0].id;
    async.eachSeries(SeedData.twitterCredentials, function(cred, eachCb) {
    const data = Object.assign({}, cred, {teamId, isPublic: true});
    const scrubbedData = TwitterCredentialFactory.scrubTwitterCredentialData(data);
    if (!TwitterCredentialFactory.validateTwitterCredentialFields(scrubbedData)) {
      throw new Error('invalid twitter credential data');  
    };
    const twitterCredentialModel = TwitterCredentialFactory.buildTwitterCredentialModel(scrubbedData);
    twitterCredentialModel.save(eachCb);
  }, cb);
  })
}

function loadUsers(cb) {
  async.eachSeries(SeedData.users, function(data, userSavedCb) {
    const pipeline = [
      cb => TeamService.queryTeams({name: data.teamName}, (err, teamModels) => {
       if (!teamModels || !teamModels.length) {
         return cb('missing team model');
       }
       return cb(err, teamModels[0]);
      }),
      (teamModel, cb) => {
        const userData = Object.assign({}, data, {team: teamModel.id});
        UserService.createUser(userData, cb);
      }
    ];
    async.waterfall(pipeline, userSavedCb);
  }, cb);
}

/**
 * Load Report Collections
 */

function loadReportCollections(cb) {
  async.eachSeries(SeedData.teams, function(data, cb) {
    const findMasterUser = cb => {
      UserService.queryUsers({email: 'jim.morgan@innosolpro.com'}, function(err, userModels) {
        if (!userModels || !userModels.length) return cb('missing required master user');
        return cb(err, userModels[0]);
      });
    }

    const findMasterTeam = (userModel, cb) => {
      TeamService.queryTeams({name: data.name}, (err, results = []) => {
        if (err) return cb(err);
        if (!results.length) return cb('missing required team');
        return cb(err, userModel, results[0]);
      })
    }

    const buildReportSets = (userModel, teamModel, cb) => {
      const reportSets = []
      async.eachSeries(data.reportSets, (data, seriesCb) => {
        const createdBy = {
          userId: userModel.id,
          userName: `${userModel.firstName} ${userModel.lastName}`
        };
        const setData = Object.assign({}, data, {
          createdBy, 
          teamId: teamModel.id
        });
        TeamService.createReportSet(setData, (err, reportSet) => {
          reportSets.push(reportSet);
          seriesCb(err);
        });
      }, (err, results) => {
        cb(err, userModel, teamModel, reportSets);
      });
    }
    
    const buildReports = (userModel, teamModel, reportSets, cb) => {
      async.eachSeries(data.reports, (data, eachCb) => {
        const createdBy = {
          userId: userModel.id,
          userName: `${userModel.firstName} ${userModel.lastName}`
        };
        const reportSet = reportSets.find(cur => cur.name === data.reportSetName);
        const reportData = Object.assign({}, data, {
          createdBy, 
          teamId: teamModel.id,
          reportSetId: reportSet.id
        });
        TeamService.createReport(reportData, eachCb);
      }, cb);
    }

    const pipeline = [
      findMasterUser,
      findMasterTeam,
      buildReportSets,
      buildReports
    ];

    async.waterfall(pipeline, cb);
  }, cb);
}

const seedPipeline = [
  dropTeams,
  dropUsers,
  dropReportLogs,
  dropReportRequests,
  dropTwitterIntegrationJobs,
  dropTwitterCredentials,
  loadUserTeams,
  loadTwitterCredentials,
  loadUsers,
  loadReportCollections
];

async.series(seedPipeline, function(err) {
  if (err) {
    console.log('there was an error running the script! ', err);
    process.exit();
  } else {
    console.log('success!');
    process.exit();
  }
});

