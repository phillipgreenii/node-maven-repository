'use strict';

/* Controllers */
angular.module("Viewer-controllers", []).controller("ViewerController", ['$scope', 'repositoryIndexAccessor',
function($scope, repositoryIndexAccessor) {
  $scope.tree = null;
  $scope.selectedArtifact = null;

  $scope.refresh = function() {
    repositoryIndexAccessor.retrieveIndex(function(tree) {
      $scope.tree = tree;
    });
    $scope.selectedArtifact = null;
  }

  $scope.refresh();
}]);
