angular.module('FlameSlackApp', [
    'ngRoute', 
    'firebase', 
    'ngSanitize'
  ]) 

  .constant('FB', 'https://flame-slack.firebaseio.com/')

  .config(function($routeProvider) {
    $routeProvider
      .when('/login', {
        controller: 'LoginCtrl',
        templateUrl: 'views/login.html',
        resolve: {
          isLogged: function(Auth) {
            return Auth.$waitForAuth()
          }
        }
      })
      .when('/register', {
        controller: 'RegisterCtrl',
        templateUrl: 'views/register.html',
        resolve: {
          usernames: function(Usernames) {
            return Usernames.$loaded()
          },
          isLogged: function(Auth) {
            return Auth.$waitForAuth()
          }
        }
      })
      .when('/channels/:channel?', {
        controller: 'ChannelCtrl',
        templateUrl: 'views/chat.html',
        resolve: {
          channels: function(Channels) {
            return Channels.$loaded()
          },
          isLogged: function(Auth) {
            return Auth.$waitForAuth()
          }
        }
      })
      .when('/messages/:user', {
        controller: 'DirectCtrl',
        templateUrl: 'views/chat.html',
        resolve: {
          usernames: function(Usernames) {
            return Usernames.$loaded()
          },
          isLogged: function(Auth) {
            return Auth.$waitForAuth()
          }
        }
      })
  })
