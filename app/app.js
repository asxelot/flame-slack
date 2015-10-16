angular.module('FlameSlackApp', ['ngRoute', 'firebase', 'ui.bootstrap'])

  .constant('FB', 'https://flame-slack.firebaseio.com/')

  .config(function($routeProvider) {
    $routeProvider
      .when('/register', {
        controller: 'AuthCtrl',
        templateUrl: 'views/register.html'
      })
      .when('/login', {
        controller: 'AuthCtrl',
        templateUrl: 'views/login.html'
      })
      .when('/channels/:channel', {
        controller: 'ChannelCtrl',
        templateUrl: 'views/channel.html',
        resolve: {
          channels: function(Channels) {
            return Channels.$loaded()
          },
          isLogged: function(Auth) {
            return Auth.$requireAuth()
          }
        }
      })
  })

