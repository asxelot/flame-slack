angular.module('FlameSlackApp')

  .directive('ngEnter', function($rootScope) {
    return {
      link: function(scope, el) {
        el.on('keypress', function(e) {
          if (e.keyCode == 13 && e.shiftKey) {
            el.css('height', el[0].scrollHeight + 22 + 'px')
            scope.$emit('form-height')
          } else if (e.keyCode == 13) {
            scope.addMessage()
            el.css('hegiht', '34px')
            scope.$emit('form-height')
          }
        })
      }
    }
  })

  .directive('ngAutoscroll', function($rootScope) {
    return {
      link: function(scope, el, attrs) {
        var form = document.getElementById('msg'),
            isScrolled = true

        function scrollToBottom() {
          if (isScrolled) el[0].scrollTop = el[0].scrollHeight
        }

        el.on('DOMNodeInserted', scrollToBottom)

        el.on('scroll', function() {
          isScrolled = el[0].scrollTop == el[0].scrollHeight - el[0].offsetHeight
        })

        scope.$on('form-height', function() {
          el.css('height', 'calc(100% - ' + form.offsetHeight + 'px)')
          scrollToBottom()
        })
      }
    }
  })