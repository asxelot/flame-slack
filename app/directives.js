angular.module('FlameSlackApp')

  .directive('ngAutoscroll', function() {
    function link(scope, el) {
      var isScrolled = false,
          scrolledPosition = 0,
          fullscreenchange = 'webkitfullscreenchange mozfullscreenchange fullscreenchange'

      function scrollToBottom() {
        if (isScrolled) el[0].scrollTop = el[0].scrollHeight
      }

      el.on('DOMSubtreeModified', scrollToBottom)

      angular.element(document).on(fullscreenchange, function(e) {
        if (e.target != document) {
          // enable fullscreen
          scrolledPosition = e.target.parentElement.offsetTop
        } else {
          el[0].scrollTop = scrolledPosition
        }
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
    function link(scope, el, attrs) {
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

  .directive('ngTabActive', function($window, $rootScope,  Title) {
    function link() {
      angular.element($window)
        .on('focus', function() {
          $rootScope.isTabActive = true
          $rootScope.$broadcast('tab-active', true)
        })
        .on('blur', function() {
          $rootScope.isTabActive = false
          $rootScope.$broadcast('tab-active', false)
        })
    }

    return {
      link: link
    }
  })

  .directive('uniqueUsername', function() {
    function link(scope, el, attrs, ngModel) {
      ngModel.$validators.uniqueUsername = function(val) {
        return !scope.usernames.hasOwnProperty(val)
      }
    }

    return {
      require: 'ngModel',
      link: link
    }
  })