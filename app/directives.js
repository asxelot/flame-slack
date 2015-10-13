angular.module('FlameSlackApp')

  .directive('ngEnter', function() {
    return {
      restrict: 'A',
      link: function(scope, el, attrs) {
        el.on('keyup', function(e) {
          if (e.shiftKey && e.keyCode == 13) {
            el[0].style.height = el[0].scrollHeight + 'px'
          } else if (e.keyCode == 13) {
            scope.addMessage()
            el[0].style.height = '34px'
          }
        })
      }
    }
  })