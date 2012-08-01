"use strict";

exports = module.exports;

var fs = require('fs'), http = require('http'), util = require('util'), crypto = require('crypto');

var mime = function(req) {
  var contentType = req.headers['content-type'] || '';
  return contentType.split(';')[0];
};

var generateRandomNumber = function() {
  var bytes = crypto.randomBytes(2);

  var val = 0;
  for (var i = 0; i < bytes.length; i++) {
    val = val << 8;
    val += bytes[i];
  }
  return val;
}
var middleware = function fileuploadMiddleware(options) {
  options = options || {}
  //TODO generate better temp dir
  var uploadDir = options.uploadDir || './tmp/uploads';
  uploadDir += uploadDir.slice(-1) !== '/' ? '/' : '';

  return function fileuploadMiddleware(req, res, next) {

    if (req.method !== 'PUT') {
      return next();
    }

    console.log("processing file upload...");
    var mimeType = mime(req);
    var fileName = uploadDir + "tmp" + generateRandomNumber() + ".file";

    var writeStream = fs.createWriteStream(fileName, {
      flags : "w",
      mode : 600
    });

    req.on('error', function(err) {
      console.error(err);
      res.send('error', 500);
    }).on('data', function(buffer) {
      writeStream.write(buffer);
    }).on('end', function() {
      req.file = {
        mimeType : mimeType,
        fileName : fileName
      };
      console.log("processed: " + fileName);
      writeStream.end();

      addCleanup(req, fileName);

      return next();
    });
  };
};

var addCleanup = function addCleanup(res, fileName) {

  var end = res.end;
  res.end = function(chunk, encoding) {
    res.end = end;
    res.end(chunk, encoding);
    console.log("cleaning up:", fileName);

    fs.exists(fileName, function(exists) {
      if (exists) {
        fs.open(fileName, 'w', function(err) {
          if (!err) {
            fs.unlink(req.file.fileName, function(err) {
              if (err) {
                console.error('Unable to remove tempfile (' + fileName + "): " + err);
              } else {
                console.log("removed", fileName);
              }
            });
          }
        });
      }
    });
  };
};

exports.middleware = middleware;
