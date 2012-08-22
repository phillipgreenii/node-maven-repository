'use strict';

/* Services */

angular.module('Viewer-services', []).factory("repositoryIndexAccessor", ['$http',
function($http) {
  var resourceUrl = '/viewer/index.js';
  return {
    retrieveIndex : function(callback) {
      $http.get(resourceUrl).success(function(val) {
        if (callback) {
          callback(val);
        }
      }).error(function(err) {
        console.error('unable to retrieveIndex:', err);
      });
    }
  };
}]);
