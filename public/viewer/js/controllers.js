'use strict';

/* Controllers */
angular.module("Viewer-controllers", []).controller("ViewerController", ['$scope', 'repositoryIndexAccessor',
function($scope, repositoryIndexAccessor) {
  function ensureProperty(obj, propertyName, defaultValue) {
    if (!obj.hasOwnProperty(propertyName)) {
      obj[propertyName] = defaultValue;
    }
    return obj[propertyName];
  }

  function buildMapsFromIndex(repoIndex) {
    var maps = {};
    for (var groupId in repoIndex) {
      for (var artifactId in repoIndex[groupId]) {
        for (var version in repoIndex[groupId][artifactId]) {
          var artifacts = repoIndex[groupId][artifactId][version];
          artifacts.artifacts.forEach(function(artifact) {
            artifact.fileName = artifact.url.split('/').slice(-1)[0];
          });
          artifacts.artifacts.sort(function(a1, a2) {
            if (a1.fileName < a2.fileName) {
              return -1;
            } else if (a1.fileName > a2.fileName) {
              return 1;
            } else {
              return 0;
            }
          });
          var level = maps;
          groupId.split('.').forEach(function(part) {
            level = ensureProperty(level, part, {});
          });
          level = ensureProperty(level, artifactId, {});
          level[version] = artifacts;
        }
      }
    }
    return maps;
  }

  function buildTreeFromMap(map) {
    if (angular.isObject(map)) {
      var l = [];
      for (var name in map) {
        var values = map[name];
        if (values.hasOwnProperty('artifactId')) {
          l.push({
            name : name,
            artifacts : values
          })
        } else {
          l.push({
            name : name,
            children : buildTreeFromMap(values)
          });
        }
      }
      return l;
    } else {
      throw new Error('invalid object:' + map);
    }

  }


  $scope.tree = null;
  $scope.selectedArtifact = null;
  //add method to convert index tree
  //add method to 'replace' one tree with the other, this should happen like a merge, so that any front end code bound to the model will update with out being confused (ie selected artifact should stay the same, but update)
  $scope.refresh = function() {
    repositoryIndexAccessor.retrieveIndex(function(repoIndex) {
      console.log('repoIndex', repoIndex);
      var maps = buildMapsFromIndex(repoIndex);
      console.log('maps', maps);
      var tree = buildTreeFromMap(maps);
      console.log('tree', tree);
      $scope.tree = tree;
    });
    $scope.selectedArtifact = null;
  }

  $scope.selectArtifacts = function(artifacts) {
    $scope.selectedArtifact = artifacts;
  }

  $scope.refresh();
}]);
