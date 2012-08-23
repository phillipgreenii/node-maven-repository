"use strict";

exports = module.exports;

var fs = require('fs'), util = require('util'), xml2js = require('xml2js'), q = require('q');
var xmlParser = new xml2js.Parser();

var MAVEN_METADATA_FILENAME = 'maven-metadata.xml';
var SNAPSHOT = 'SNAPSHOT';

var readdirPromise = q.nbind(fs.readdir, fs);
var statPromise = q.nbind(fs.stat, fs);

var readFilePromise = q.nbind(fs.readFile, fs);
var parseXmlPromise = q.nbind(xmlParser.parseString, xmlParser);

function crawlPathForFilesPromise(path) {
  return statPromise(path).then(function(stats) {
    if (stats.isDirectory()) {
      return readdirPromise(path).then(function(files) {
        var childPromises = [];
        files.forEach(function(childpath) {
          var fullChildPath = path + "/" + childpath;
          childPromises.push(crawlPathForFilesPromise(fullChildPath));
        });
        return q.allResolved(childPromises).then(function(completedChildPromises) {
          var artifactFiles = [];
          completedChildPromises.forEach(function(childPromise) {
            var value = childPromise.valueOf();

            if (value) {
              if (util.isArray(value)) {
                artifactFiles.push.apply(artifactFiles, value);
              } else {
                artifactFiles.push(value);
              }
            }
          });
          return q.resolve(artifactFiles);
        });
      });
    } else if (stats.isFile()) {
      return path;
    } else {
      return q.fcall(function() {
        throw new Error("Unsupported file type: " + stats);
      });
    }
  });
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function contains(str, substr) {
  return str.indexOf(substr) !== -1;
}

function startsWith(str, prefix) {
  return str.indexOf(prefix) === 0;
}

function asList(val) {
  if (util.isArray(val)) {
    return val;
  } else {
    return [val];
  }
}

function addArtifactTo(artifactInfo, url) {

  var fileName = url.split('/').slice(-1)[0];
  var prefix;
  if (artifactInfo.snapshot) {
    prefix = [artifactInfo.artifactId, artifactInfo.version.replace('-SNAPSHOT', ''), artifactInfo.timestamp, artifactInfo.buildNumber].join('-');
  } else {
    prefix = [artifactInfo.artifactId, artifactInfo.version].join('-');
  }

  if (fileName.indexOf(prefix) !== 0) {
    console.error('incorrect fileName', prefix, fileName);
    return;
  }

  var remainder = fileName.replace(prefix, '');
  var parts = remainder.split('.');

  var classifier = (parts[0] || '').replace('-', '');
  var extension = parts[1];
  var checksumType = parts.length === 3 ? parts[2] : null;

  var matches = artifactInfo.artifacts.filter(function(artifact) {
    return artifact.classifier === classifier && artifact.extension === extension;
  });

  var artifact;
  if (matches.length === 0) {
    artifact = {
      extension : extension,
      classifier : classifier,
      url : '',
      checksumUrls : []
    }
    artifactInfo.artifacts.push(artifact);
  } else {
    artifact = matches[0];
  }

  if (!checksumType) {
    artifact.url = url;
  } else {
    artifact.checksumUrls.push({
      name : checksumType,
      url : url
    });
  }
}

function buildStructureFromFilesPromise(rootPath, urlPathPrefix, files) {
  //sort so that artifact level metadata files appear before version level metadata files and
  //original files appear before checksum
  files.sort(function(a, b) {
    return a.length - b.length;
  });

  // strip repo prefix to create urls
  var urls = files.map(function(file) {
    return file.replace(rootPath, '');
  });

  //filter metadata files
  var metadataFiles = files.filter(function(file) {
    return endsWith(file, MAVEN_METADATA_FILENAME);
  });

  var childPromises = [];
  metadataFiles.forEach(function(metadataFile) {
    childPromises.push(readFilePromise(metadataFile).then(parseXmlPromise));
  });
  return q.allResolved(childPromises).then(function(completedChildPromises) {
    var structure = {};
    completedChildPromises.forEach(function(childPromise) {
      var metadata = childPromise.valueOf();

      if (metadata) {
        if (!structure.hasOwnProperty(metadata.groupId)) {
          structure[metadata.groupId] = {};
        }
        var group = structure[metadata.groupId];
        if (!group.hasOwnProperty(metadata.artifactId)) {
          group[metadata.artifactId] = {};
        }
        var artifact = group[metadata.artifactId];
        if (!metadata.hasOwnProperty('version')) {
          asList(metadata.versioning.versions.version).forEach(function(version) {
            if (!artifact.hasOwnProperty(version)) {
              artifact[version] = {
                groupId : metadata.groupId,
                artifactId : metadata.artifactId,
                version : version,
                artifacts : []
              };
            }

            //only handle releases
            if (!endsWith(version, SNAPSHOT)) {
              artifact[version].snapshot = false;

              var urlPrefix = '/' + metadata.groupId.replace(new RegExp("\\.", "gm"), '/') + '/' + metadata.artifactId + '/' + version + '/';

              var artifactVersionUrls = urls.filter(function(url) {
                return startsWith(url, urlPrefix) && !contains(url, MAVEN_METADATA_FILENAME);
              });
              artifactVersionUrls.forEach(function(url) {
                addArtifactTo(artifact[version], urlPathPrefix + url);
              });
            } else {
              artifact[version].snapshot = true;
            }
          });
        } else {
          var version = metadata.version;
          if (!artifact.hasOwnProperty(version)) {
            artifact[version] = {
              groupId : metadata.groupId,
              artifactId : metadata.artifactId,
              version : version,
              snapshot : true,
              artifacts : []
            };
          }
          artifact[version].timestamp = metadata.versioning.snapshot.timestamp;
          artifact[version].buildNumber = metadata.versioning.snapshot.buildNumber;

          var urlPrefix = '/' + metadata.groupId.replace(new RegExp("\\.", "gm"), '/') + '/' + metadata.artifactId + '/' + version + '/';

          var snapshotId = artifact[version].timestamp + '-' + artifact[version].buildNumber;
          var artifactVersionUrls = urls.filter(function(url) {
            return startsWith(url, urlPrefix) && !contains(url, MAVEN_METADATA_FILENAME) && contains(url, snapshotId);
          });
          artifactVersionUrls.forEach(function(url) {
            addArtifactTo(artifact[version], urlPathPrefix + url);
          });
        }
      }
    });
    return structure;
  });

  var example = {
    groupId : '',
    artifactId : '',
    version : '',
    artifacts : [{
      extension : '',
      classifier : '',
      url : '',
      checksumUrls : {
        sha1 : '',
        md5 : ''
      }
    }]
  };

  //return q.resolve(structure);
}

var _handleError = function(err) {
  console.error.apply(console, arguments);
}
var buildStructure = function(path, urlPrefix, callback) {
  console.log('building structure from', path);
  crawlPathForFilesPromise(path).then(function(files) {
    return buildStructureFromFilesPromise(path, urlPrefix, files)
  }).then(function(structure) {
    callback((
    void 0), structure);
  }).fail(function(err) {
    _handleError(err);
    callback(err);
  }).end();
}

exports.buildStructure = buildStructure;
exports._internals = {};
exports._internals.crawlPathForFilesPromise = crawlPathForFilesPromise;
exports._internals.buildStructureFromFilesPromise = buildStructureFromFilesPromise;
exports._internals.addArtifactTo = addArtifactTo;

