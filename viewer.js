"use strict";

exports = module.exports;

var fs = require('fs'), http = require('http'), util = require('util'), crypto = require('crypto'), xml2js = require('xml2js');
var xmlParser = new xml2js.Parser();

var StructureBuilder = function(repoPath) {
  var self = this;
  var MAVEN_METADATA_FILENAME = 'maven-metadata.xml';

  self.structure = [];

  function handleMavenMetadata(file, callback) {

    fs.readFile(file, function(err, data) {
      xmlParser.parseString(data, function(err, result) {
        self.structure.push({
          file : file,
          data : result
        });
        //console.dir(result);
        callback();
      });
    });

  }

  function handleFile(file, callback) {
    if (file.substr(-1 * MAVEN_METADATA_FILENAME.length) === MAVEN_METADATA_FILENAME) {
      handleMavenMetadata(file, callback);
    } else {
      callback();
    }
  }

  function contains(array, value) {
    var len = array.length;
    for (var i = 0; i < len; i++) {
      if (len[i] === value) {
        return true;
      }
    }
    return false;
  }

  function handleArtifact(directory, files, callback) {

  }

  function crawlDirectoryTree(root, callback) {
    fs.stat(root, function(err, stats) {
      if (err) {
        _handleError(err);
      } else if (!stats.isDirectory()) {
        if (stats.isFile()) {
          handleFile(root, callback);
        } else {
          _handleError('Unsupported File Type:', stats);
        }
      } else {
        fs.readdir(root, function(err, files) {
          if (err) {
            _handleError(err);
          } else {
            if (contains(files, MAVEN_METADATA_FILENAME)) {
              handleArtifact(root, files, callback);
            } else {
              var nextCallBack = callback;
              for (var i = files.length - 1; i >= 0; i--) {
                nextCallBack = (function(newRoot, nextCallBack) {
                  return function() {
                    crawlDirectoryTree(newRoot, nextCallBack)
                  };
                })(root + "/" + files[i], nextCallBack);
              }
              nextCallBack();
            }
          }
        });
      }
    });
  }


  self.buildStructure = function(callback) {
    crawlDirectoryTree(repoPath, function() {
      callback(self.err, self.structure);
    });
  }
  var _handleError = function(err) {
    console.error.apply(arguments);
    self.err = err;
  }
}
var buildStructure = function(repoPath, callback) {
  var sb = new StructureBuilder(repoPath);
  sb.buildStructure(callback);
}

exports.buildStructure = buildStructure;
