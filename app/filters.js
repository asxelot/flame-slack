angular.module('FlameSlackApp')

  .filter('link', function() {
    return function(text) {
      var linkRegExp = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/gi

      return text.replace(linkRegExp, function(link, protocol) {
        return '<a href="' + (protocol ? '' : 'http://') + 
                link + '" target="_blank">' + link + '</a>'
      })
    }
  })

  .filter('trustAsHtml', function($sce){
    return function(text) {
      return $sce.trustAsHtml(text)
    }
  })