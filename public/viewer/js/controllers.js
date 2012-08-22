'use strict';

/* Controllers */
angular.module("Viewer-controllers",[]).controller("ViewerController", ['$scope', 'repositoryIndexAccessor',
function($scope, repositoryIndexAccessor) {
  $scope.tree = {};
  $scope.selectedArtifact = null;
}]);
