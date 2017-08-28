'use strict';

/* Directives */

angular.module('Viewer.directives', []).directive('viewerTree', function() {
  return {
    restrict : 'A',
    link : function(scope, elm, attrs) {

      var treeDataVar = attrs['viewerTree'];
      var onSelectVar = attrs['viewerTreeOnSelect'];
      var onSelect = scope.$eval(onSelectVar);

      scope.$watch(treeDataVar, function(treeData) {
        console.log('updating tree');
        elm.tree({
          data : (treeData || []),
          //saveState : true, //causes Uncaught TypeError: Cannot call method 'iterate' of undefined
          selectable : true,
          autoOpen:true,
          onCanSelectNode : function(node) {
            return node.artifacts;
          }
        });

      });

      elm.bind('tree.click', function(event) {
        onSelect(event.node.artifacts);
        scope.$apply();
      });

    }
  }

});

