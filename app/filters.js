angular.module('FlameSlackApp')


  .filter('escape', function() {
    var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;'
    }

    return function(string) {
      return String(string).replace(/[&<>"']/g, function(s) {
        return entityMap[s]
      })
    }
  })

  .filter('link', function() {
    var linkRegExp = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})\/([\/\w\.-]*)*\/?/gi
    var imageRegExp = /\.(jpg|jpeg|png|gif)/

    return function(text) {
      return text.replace(linkRegExp, function(link, protocol) {
        var html = '<a href="' + (protocol ? '' : 'http://') + 
                    link + '" target="_blank">' + link + '</a>'

        if (imageRegExp.test(link))
          html += '<img src="' + link + '">'

        return html
      })
    }
  })

  .filter('username', function($rootScope) {
    return function(text) {
      var users = $rootScope.users.map(function(user) {return user.username})

      return text.replace(/@(\w+)/, function(match, username) {
        var currentUser = $rootScope.user.username == username

        if (~users.indexOf(username)) {
          if (currentUser) $rootScope.$broadcast('mention')

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
    return $sce.trustAsHtml
  })

