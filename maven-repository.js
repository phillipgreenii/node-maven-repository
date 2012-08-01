"use strict";

exports = module.exports;

var fs = require('fs');

var ensureDirectory = function(directoryPath, callback) {
  fs.exists(directoryPath, function(exists) {
    if (exists) {
      fs.stat(directoryPath, function(err, stats) {
        if (err) {
          console.log(err);
          res.send('unable to save file: ' + err, 500);
          return false;
        }
        if (!stats.isDirectory()) {
          console.log('path is not a directory: ' + directoryPath);
          res.send('path is not a directory: ' + directoryPath, 500);
          return false;
        }
        callback();
        return true;
      })
    } else {
      console.info('creating directory', directoryPath);
      fs.mkdir(directoryPath, '755', function(err) {
        if (err) {
          console.log('unable to create directory (' + directoryPath + '): ' + err);
        } else {
          callback();
          return true;
        }
      });
    }
  });
}
var ensureDirectoryStructureFor = function(root, path, callback) {
  console.log('ensureDirectoryStructureFor(%s,%s)', root, path);
  var currentPath = root;
  var parts = path.split('/');

  var subDirectories = [];
  for (var i = 0; i < parts.length - 1; i++) {
    if (parts[i] && parts[i].length > 0) {
      currentPath = currentPath + '/' + parts[i];
      subDirectories.push(currentPath);
    }
  }

  var nextCallBack = callback;
  for (var i = subDirectories.length - 1; i >= 0; i--) {
    nextCallBack = (function(directoryPath, nextCallBack) {
      return function() {
        ensureDirectory(directoryPath, nextCallBack)
      };
    })(subDirectories[i], nextCallBack);
  }
  return nextCallBack();
}
var middleware = function mavenRepositoryMiddleware(options) {
  options = options || {}
  console.log('mavenRepositoryMiddleware', 'options', options);
  var repositoryRootPath = options.repositoryPath || './repo';
  repositoryRootPath = repositoryRootPath.slice(-1) !== '/' ? repositoryRootPath : repositoryRootPath.slice(-1);

  return function mavenRepositoryMiddleware(req, res, next) {
    if (!req.file) {
      return next();
    }

    console.log("filePath:" + req.url);

    console.log(req.file);

    var partialPath = req.url[0] === '/' ? req.url.slice(1) : req.url;
    var filePath = repositoryRootPath + '/' + partialPath;

    fs.exists(filePath, function(exists) {

      if (exists) {
        console.log("file already exists: " + filePath);
        //res.send('file already exists', 403);
      }
      ensureDirectoryStructureFor(repositoryRootPath, partialPath, function() {
        console.info('renaming "%s" to "%s"', req.file.fileName, filePath);
        fs.rename(req.file.fileName, filePath, function(err) {
          if (err) {
            console.error('unable to rename file', err);
            res.send(err, 500);
          } else {
            fs.chmod(filePath, '644', function(err) {
              if (err) {
                console.error('unable to chmod file (' + filePath + '): ' + err);
              }
            });

            console.log("Added file: " + filePath);
            res.send('success', 200);
          }
        });
      });
    });
  };
};

exports.middleware = middleware;
