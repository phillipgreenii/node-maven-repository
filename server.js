#!/usr/bin/env node
//  OpenShift sample Node application
"use strict";


var connect  = require('connect');
var express = require('express');
var fileupload = require('./fileupload');
var mavenRepository = require('./maven-repository');
var viewer = require('./viewer');

// Create "connect" server.
var app = express.createServer();

var root = __dirname + '/root';
var uploadDir = root + '/.uploads';
var repoDir = root + '/repo';
var repoUrlPrefix = '/repo';

app.use(connect.favicon('favicon.ico'))
  .use(connect.logger('dev'))
  .use(connect.limit('10mb'))
  .use(connect.compress())  
  .use(fileupload.middleware({uploadDir:uploadDir}))
  .use(mavenRepository.middleware({repositoryPath:repoDir}))
  .use('/',app.router)
  .use(repoUrlPrefix,connect.directory(repoDir))
  .use(repoUrlPrefix,connect.static(repoDir))
  .use('/viewer',connect.static('./public/viewer'))
  .use(connect.errorHandler())
  ;

app.get('/viewer/index.js', function(req,res,next){
  viewer.buildStructure(repoDir, repoUrlPrefix, function(err,structure){
    if(err) {
      res.send(500);
    } else {
      res.json(structure);
    }
  });
  
});


/*  =====================================================================  */
/*  Setup route handlers.  */
/*  =====================================================================  */

//  Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_INTERNAL_IP;
var port    = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

if (typeof ipaddr === "undefined") {
   console.warn('No OPENSHIFT_INTERNAL_IP environment variable');
}

//  terminator === the termination handler.
function terminator(sig) {
   if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...',
                  Date(Date.now()), sig);
      process.exit(1);
   }
   console.log('%s: Node server stopped.', Date(Date.now()) );
}

//  Process on exit and signals.
process.on('exit', function() { terminator(); });

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});

//  And start the app on that interface (and port).
app.listen(port, ipaddr, function() {
   console.log('%s: Node server started on %s:%d ...', Date(Date.now() ),
               ipaddr, port);
});

