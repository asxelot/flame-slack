angular.module('FlameSlackApp')

  .directive('ngAutoscroll', function() {
    return {
      link: function(scope, el, attrs) {
            isScrolled = false

        el.on('DOMNodeInserted', function() {
          if (isScrolled) el[0].scrollTop = el[0].scrollHeight
        })

        el.on('scroll', function() {
          isScrolled = el[0].scrollTop == el[0].scrollHeight - el[0].offsetHeight
        })

        scope.$on('dividerTop', function(e, top) {
          el[0].scrollTop = top
        })
      }
    }
  })

  .directive('divider', function() {
    return {
      link: function(scope, el) {
        scope.$emit('dividerTop', el[0].offsetTop - 150)
      }
    }
  })