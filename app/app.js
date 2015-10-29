angular.module('FlameSlackApp', [
  'ngRoute', 
  'firebase', 
  'ui.bootstrap',
  'ngSanitize'
])

  .constant('FB', 'https://flame-slack.firebaseio.com/')

  .config(function($routeProvider) {
    $routeProvider
      .when('/login', {
        controller: 'LoginCtrl',
        templateUrl: 'views/login.html'
      })
      .when('/register', {
        controller: 'RegisterCtrl',
        templateUrl: 'views/register.html',
        resolve: {
          usernames: function(Usernames) {
            return Usernames.$loaded()
          }
        }
      })
      .when('/channels/:channel?', {
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
      .when('/messages/:user', {
        controller: 'DirectCtrl',
        templateUrl: 'views/channel.html',
        resolve: {
          usernames: function(Usernames) {
            return Usernames.$loaded()
          },
          isLogged: function(Auth) {
            return Auth.$requireAuth()
          }
        }
      })
      .when('/404', {
        templateUrl: 'views/404.html'
      })
  })
