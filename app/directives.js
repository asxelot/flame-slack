angular.module('FlameSlackApp')

  .directive('ngAutoscroll', function() {
    function link(scope, el) {
      var isScrolled = false

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

    return {
      link: link
    }
  })

  .directive('ngFocus', function() {
    function link(scope, el) {
      el[0].focus()
    }

    return {
      link: link
    }
  })

  .directive('divider', function() {
    function link(scope, el) {
      scope.$emit('dividerTop', el[0].offsetTop - 150)
    }

    return {
      link: link
    }
  })