angular.module('FlameSlackApp')

  .directive('ngEnter', function($window) {
    return {
      restrict: 'A',
      link: function(scope, el) {
        el.on('keyup', function(e) {
          if (e.keyCode == 13) scope.addMessage()
        })
      }
    }
  })

  .directive('ngScroll', function() {
    return {
      link: function(scope, el, attrs) {
        el.on('DOMNodeInserted', function() {
          el[0].scrollTop = el[0].scrollHeight
        })
      }
    }
  })