angular.module('FlameSlackApp')
  .directive('ngAutoscroll', ngAutoscroll)
  .directive('divider', divider)
  .directive('ngTabActive', ngTabActive)
  .directive('uniqueUsername', uniqueUsername)
  .directive('ngEnter', ngEnter)
  .directive('ngFocus', ngFocus)


function ngAutoscroll() {
  function link($scope, $el) {
    var el = $el[0],
        isScrolled = true,
        fullscreenchange = 'webkitfullscreenchange mozfullscreenchange fullscreenchange'

    function scrollToBottom() {
      if (isScrolled) el.scrollTop = el.scrollHeight
    }

    $el.on('DOMSubtreeModified', scrollToBottom)

    // chrome scroll fix
    angular.element(document).on(fullscreenchange, scrollToBottom)

    $el.on('scroll', function() {
      isScrolled = el.scrollTop == el.scrollHeight - el.offsetHeight
    })

    $scope.$on('dividerTop', function(e, top) {
      el.scrollTop = top
    })
  }

  return {
    link: link
  }
}


function ngFocus() {
  function link($scope, $el) {
    $el[0].focus()
  }

  return {
    link: link
  }
}

function divider() {
  function link($scope, $el) {
    angular.element(document.getElementById('chat'))
      .one('DOMSubtreeModified', function() {
        $scope.$emit('dividerTop', $el[0].offsetTop - 150)
      })
  }

  return {
    link: link
  }
}

function ngTabActive($window, $rootScope,  Title) {
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
}

function uniqueUsername() {
  function link($scope, $el, $attrs, ngModel) {
    ngModel.$validators.uniqueUsername = function(val) {
      return !$scope.usernames.hasOwnProperty(val)
    }
  }

  return {
    require: 'ngModel',
    link: link
  }
}

function ngEnter() {
  function link($scope, $el) {
    $el.on('input', function() {
      $el.css('height', $el[0].scrollHeight + 2 + 'px')
    })

    $el.on('keydown', function(e) {
      if (e.keyCode == 13 && !e.shiftKey) {
        $scope.ngEnter()
        $el.css('height', '34px')
        e.preventDefault()
      }
    })
  }

  return {
    scope: {
      ngEnter: '&'
    },
    link: link
  }
}