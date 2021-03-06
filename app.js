'use strict';

/**
 * Module dependencies.
 */
const https          = require('https');
const fs             = require('fs');
const express        = require('express');
const bodyParser     = require('body-parser');
const logger         = require('morgan');
const mongoose       = require('mongoose');
const dotenv         = require('dotenv');
const apiRouter      = require('./api/index');
const socket         = require('./socket/index');
const jinro          = require('./services/jinro');
const path           = require('path');

/*
 * Read environment config
 */
dotenv.config();

/** 
 * SSL Certificate/Key
 */
const sslPrivateKey = fs.readFileSync('ssl/innosol.pem', 'utf8');
const sslCertificate = fs.readFileSync('ssl/STAR_innosolpro_com.crt', 'utf8');
const sslCreds = {
  key: sslPrivateKey,
  cert: sslCertificate
};

/**
 * Connect to MongoDB
 */
require('./config/mongo').config();

/*
 * Create our express app and server
 */
const app     = express();
app.disable('etag'); //disable 304 responses
const httpsServer = https.createServer(sslCreds, app);

/**
 * App Configuration
 */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Api Router
 */
apiRouter.config(app);

// Handles all routes so you do not get a not found error
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
});

/**
 * Config Sockets
 */
socket.config(httpsServer);

// ======================================================
// Reboot Integrations
// ======================================================
jinro.rebootActiveIntegrations();

/**
 * Listen on ports
 */

httpsServer.listen(process.env.HTTPS_PORT);