angular.module('FlameSlackApp')

  .filter('link', function() {
    return function(text) {
      var linkRegExp = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?/gi

      return text.replace(linkRegExp, function(link, protocol) {
        return '<a href="' + (protocol ? '' : 'http://') + 
                link + '" target="_blank">' + link + '</a>'
      })
    }
  })

  .filter('username', function($rootScope) {
    return function(text) {
      var users = $rootScope.users.map(function(user) {return user.username})

      return text.replace(/@(\w+)/, function(match, username) {
        var currentUser = $rootScope.user.username == username

        if (~users.indexOf(username)) {
          if (currentUser)
            $rootScope.$broadcast('mention')

          return '<a href="#/user/' + username + '"' +
                 (currentUser ? 'class="mention"' : '') +
                 '>' + match + '</a>'
        } else {
          return match
        }
      })
    }
  })

  .filter('trustAsHtml', function($sce){
    return function(text) {
      return $sce.trustAsHtml(text)
    }
  })