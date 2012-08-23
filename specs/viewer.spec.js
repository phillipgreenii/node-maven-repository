"use strict";

var viewer = require('../viewer.js'), util = require('util');

describe('viewer', function() {

  describe('addArtifactTo', function() {
    var addArtifactTo = viewer._internals.addArtifactTo;

    describe('releases', function() {

      it('add jar for release', function() {
        var artifactInfo = {
          groupId : 'com.ii.green.phillip.nodeMavenRepo',
          artifactId : 'noddeMavenRepo-test-project',
          version : '2.0',
          artifacts : []
        };
        var url = '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0.jar';
        addArtifactTo(artifactInfo, url);

        expect(artifactInfo.artifacts.length).toEqual(1);
        expect(artifactInfo.artifacts[0]).toEqual({
          extension : 'jar',
          classifier : '',
          url : url,
          checksumUrls : []
        });
      });

      it('add md5 checksum of jar for release', function() {
        var artifactInfo = {
          groupId : 'com.ii.green.phillip.nodeMavenRepo',
          artifactId : 'noddeMavenRepo-test-project',
          version : '2.0',
          artifacts : [{
            extension : 'jar',
            classifier : '',
            url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0.jar',
            checksumUrls : []
          }]
        };
        var url = '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0.jar.md5';
        addArtifactTo(artifactInfo, url);

        expect(artifactInfo.artifacts.length).toEqual(1);
        expect(artifactInfo.artifacts[0]).toEqual({
          extension : 'jar',
          classifier : '',
          url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0.jar',
          checksumUrls : [{
            name : 'md5',
            url : url
          }]
        });
      });

      it('add sources jar for release', function() {
        var artifactInfo = {
          groupId : 'com.ii.green.phillip.nodeMavenRepo',
          artifactId : 'noddeMavenRepo-test-project',
          version : '2.0',
          artifacts : [{
            extension : 'jar',
            classifier : '',
            url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0.jar',
            checksumUrls : [{
              name : 'md5',
              url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0.jar.md5'
            }]
          }]
        };
        var url = '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0-sources.jar';
        addArtifactTo(artifactInfo, url);

        expect(artifactInfo.artifacts.length).toEqual(2);
        expect(artifactInfo.artifacts[1]).toEqual({
          extension : 'jar',
          classifier : 'sources',
          url : url,
          checksumUrls : []
        });
      });

      it('add md5 checksum of sources jar for release', function() {
        var artifactInfo = {
          groupId : 'com.ii.green.phillip.nodeMavenRepo',
          artifactId : 'noddeMavenRepo-test-project',
          version : '2.0',
          artifacts : [{
            extension : 'jar',
            classifier : '',
            url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0.jar',
            checksumUrls : [{
              name : 'md5',
              url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0.jar.md5'
            }]
          }, {
            extension : 'jar',
            classifier : 'sources',
            url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0-sources.jar',
            checksumUrls : []
          }]
        };
        var url = '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0-sources.jar.md5';

        addArtifactTo(artifactInfo, url);

        expect(artifactInfo.artifacts.length).toEqual(2);
        expect(artifactInfo.artifacts[1]).toEqual({
          extension : 'jar',
          classifier : 'sources',
          url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0-sources.jar',
          checksumUrls : [{
            name : 'md5',
            url : url
          }]
        });
      });

    });

    describe('snapshots', function() {

      it('add jar for snapshot', function() {
        var artifactInfo = {
          groupId : 'com.ii.green.phillip.nodeMavenRepo',
          artifactId : 'noddeMavenRepo-test-project',
          version : '2.0-SNAPSHOT',
          snapshot : true,
          timestamp : '20120821.120944',
          buildNumber : '1',
          artifacts : []
        };
        var url = '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0-SNAPSHOT/noddeMavenRepo-test-project-2.0-20120821.120944-1.jar';
        addArtifactTo(artifactInfo, url);

        expect(artifactInfo.artifacts.length).toEqual(1);
        expect(artifactInfo.artifacts[0]).toEqual({
          extension : 'jar',
          classifier : '',
          url : url,
          checksumUrls : []
        });
      });

      it('add md5 checksum of jar for snapshot', function() {
        var artifactInfo = {
          groupId : 'com.ii.green.phillip.nodeMavenRepo',
          artifactId : 'noddeMavenRepo-test-project',
          version : '2.0-SNAPSHOT',
          snapshot : true,
          timestamp : '20120821.120944',
          buildNumber : '1',
          artifacts : [{
            extension : 'jar',
            classifier : '',
            url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0-SNAPSHOT/noddeMavenRepo-test-project-2.0-20120821.120944-1.jar',
            checksumUrls : []
          }]
        };
        var url = '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0-SNAPSHOT/noddeMavenRepo-test-project-2.0-20120821.120944-1.jar.md5';
        addArtifactTo(artifactInfo, url);

        expect(artifactInfo.artifacts.length).toEqual(1);
        expect(artifactInfo.artifacts[0]).toEqual({
          extension : 'jar',
          classifier : '',
          url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0-SNAPSHOT/noddeMavenRepo-test-project-2.0-20120821.120944-1.jar',
          checksumUrls : [{
            name : 'md5',
            url : url
          }]
        });
      });

      it('add sources jar for snapshot', function() {
        var artifactInfo = {
          groupId : 'com.ii.green.phillip.nodeMavenRepo',
          artifactId : 'noddeMavenRepo-test-project',
          version : '2.0-SNAPSHOT',
          snapshot : true,
          timestamp : '20120821.120944',
          buildNumber : '1',
          artifacts : [{
            extension : 'jar',
            classifier : '',
            url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0-SNAPSHOT/noddeMavenRepo-test-project-2.0-20120821.120944-1.jar',
            checksumUrls : [{
              name : 'md5',
              url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0-SNAPSHOT/noddeMavenRepo-test-project-2.0-20120821.120944-1.jar.md5'
            }]
          }]
        };
        var url = '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0-20120821.120944-1-sources.jar';
        addArtifactTo(artifactInfo, url);

        expect(artifactInfo.artifacts.length).toEqual(2);
        expect(artifactInfo.artifacts[1]).toEqual({
          extension : 'jar',
          classifier : 'sources',
          url : url,
          checksumUrls : []
        });
      });

      it('add md5 checksum of sources jar for snapshot', function() {
        var artifactInfo = {
          groupId : 'com.ii.green.phillip.nodeMavenRepo',
          artifactId : 'noddeMavenRepo-test-project',
          version : '2.0-SNAPSHOT',
          snapshot : true,
          timestamp : '20120821.120944',
          buildNumber : '1',
          artifacts : [{
            extension : 'jar',
            classifier : '',
            url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0-20120821.120944-1.jar',
            checksumUrls : [{
              name : 'md5',
              url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0-20120821.120944-1.jar.md5'
            }]
          }, {
            extension : 'jar',
            classifier : 'sources',
            url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0-20120821.120944-1-sources.jar',
            checksumUrls : []
          }]
        };
        var url = '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0-20120821.120944-1-sources.jar.md5';
        addArtifactTo(artifactInfo, url);

        expect(artifactInfo.artifacts.length).toEqual(2);
        expect(artifactInfo.artifacts[1]).toEqual({
          extension : 'jar',
          classifier : 'sources',
          url : '/com/ii/green/phillip/nodeMavenRepo/noddeMavenRepo-test-project/2.0/noddeMavenRepo-test-project-2.0-20120821.120944-1-sources.jar',
          checksumUrls : [{
            name : 'md5',
            url : url
          }]
        });
      });

    });
  });

  describe('crawlPathForFilesPromise', function() {
    it('crawl repo for files', function(done) {
      viewer._internals.crawlPathForFilesPromise('specs/mock-repo').then(function(files) {
        expect(files.length).toEqual(96);
        done();
      });
    });
  });

  describe('buildStructureFromFilesPromise', function() {
    it('build structure from files', function(done) {
      var rootPath = '';
      var urlPrefix = '';
      var files = [];
      viewer._internals.buildStructureFromFilesPromise(rootPath, urlPrefix, files).then(function(structure) {
        console.log("structure", util.inspect(structure, false, null));
        expect(structure).toBeDefined();
        done();
      });
    });
  });

  describe('buildStructure', function() {
    it('build structure from repo', function(done) {
      viewer.buildStructure('specs/mock-repo', '', function(err, structure) {
        expect(err).not.toBeDefined();
        expect(structure).toBeDefined();
        console.log("structure", util.inspect(structure, false, null));
        done();
      });
    });
  });

});
