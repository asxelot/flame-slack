angular.module('FlameSlackApp')
  .filter('escape', escape)
  .filter('code', code)
  .filter('quote', quote)
  .filter('link', link)
  .filter('username', username)
  .filter('channel', channel)
  .filter('trustAsHtml', trustAsHtml)
  .filter('trustAsResourceUrl', trustAsResourceUrl)


function escape() {
  return function(text) {
    return (text||'').replace(/</g, '&lt;')
  }
}

function code() {
  return function(text) {
    return (text||'').replace(/```([^`]+)```/g, '<pre>$1</pre>')
                     .replace(/`([^`]+)`/g, '<code>$1</code>')
  }
}

function quote() {
  return function(text) {
    return (text||'').replace(/^>([^\n]+)$\n?/gm, '<blockquote>$1</blockquote>')
  }
}

function link($http) {
  var linkRegExp = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})\/([\/\w\.\-=?]*)*\/?/gi
  var imageRegExp = /\.(jpg|jpeg|png|gif)/
  var youtubeRegExp = /(https?:\/\/)(www\.)?youtu\.?be(\.com)?\/(watch\?v=)?([\w\-_]+)(\?t=)?(\w+)?/i
  var vimeoRegExp = /https?:\/\/vimeo\.com\/(\d+)/i


  return function(text, scope) {
    return (text||'').replace(linkRegExp, function(link, protocol) {
      var html = '<a href="' + (protocol ? '' : 'http://') + 
                  link + '" target="_blank">' + link + '</a>'

      if (imageRegExp.test(link) && !scope.image) 
        scope.image = { src: link }

      if (youtubeRegExp.test(link) && !scope.youtube) 
        scope.youtube = { id: link.match(youtubeRegExp)[5] }

      if (vimeoRegExp.test(link) && !scope.vimeo) {
        var vimeoId = link.match(vimeoRegExp)[1]
        scope.vimeo = { id: vimeoId }

        $http.jsonp('https://vimeo.com/api/v2/video/' + vimeoId +
                   '.json?callback=JSON_CALLBACK')
          .success(function(data) {
            scope.vimeo.preview = data[0].thumbnail_large
          })
      }

      return html
    })
  }
}

function username() { 
  return function(text, scope) {
    var users = scope.users.map(function(user) {return user.username})

    return (text||'').replace(/@(\w+)/, function(match, username) {
      var currentUser = scope.user.username == username

      if (~users.indexOf(username)) {
        if (currentUser) scope.$emmit('mention')

        return '<a href="#/messages/' + username + '"' +
               (currentUser ? 'class="mention"' : '') +
               '>' + match + '</a>'
      } else {
        return match
      }
    })
  }
}

function channel() {
  return function(text, scope) {
    return (text||'').replace(/#(\w+)/gi, function(match, channel) {
      if (scope.channels.hasOwnProperty(channel))
        return '<a href="#/messages/' + channel + '">' + match + '</a>'
      else
        return match
    })
  }
}

function trustAsHtml($sce){
  return $sce.trustAsHtml
}

function trustAsResourceUrl($sce) {
  return $sce.trustAsResourceUrl
}


