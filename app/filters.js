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

  .filter('link', function($http) {
    var linkRegExp = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})\/([\/\w\.\-=?]*)*\/?/gi
    var imageRegExp = /\.(jpg|jpeg|png|gif)/
    var youtubeRegExp = /(https?:\/\/)(www\.)?youtu\.?be(\.com)?\/(watch\?v=)?([\w\-_]+)(\?t=)?(\w+)?/i
    var vimeoRegExp = /https?:\/\/vimeo\.com\/(\d+)/i


    return function(text, ctrl) {
      return text.replace(linkRegExp, function(link, protocol) {
        var html = '<a href="' + (protocol ? '' : 'http://') + 
                    link + '" target="_blank">' + link + '</a>'

        if (imageRegExp.test(link))
          html += '<img src="' + link + '">'

        if (youtubeRegExp.test(link)) 
          ctrl.youtube = {
            id: link.match(youtubeRegExp)[5]
          }

        if (vimeoRegExp.test(link) && !ctrl.vimeo) {
          var vimeoId = link.match(vimeoRegExp)[1]

          ctrl.vimeo = {
            id: vimeoId
          }

          $http
            .jsonp('https://vimeo.com/api/v2/video/' + 
                    vimeoId + '.json?callback=JSON_CALLBACK')
            .success(function(data) {
              ctrl.vimeo.preview = data[0].thumbnail_large
            })
        }

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

  .filter('trustAsResourceUrl', function($sce) {
    return $sce.trustAsResourceUrl
  })


