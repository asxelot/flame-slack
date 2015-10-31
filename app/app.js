angular.module('FlameSlackApp', [
    'ui.router', 
    'firebase', 
    'ngSanitize'  
  ])  

  .constant('FB', 'https://flame-slack.firebaseio.com/')

  .config(router)


function router($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', { 
      url: '/login',
      controller: 'LoginCtrl',
      templateUrl: 'views/login.html',
      resolve: {
        isLogged: function(Auth) {
          return Auth.$waitForAuth()
        }
      }
    })
    .state('register', {
      url: '/register',
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
    .state('messages', {
      controller: 'MessagesCtrl',
      templateUrl: 'views/messages.html',
      resolve: {
        isLogged: function(Auth) {
          return Auth.$waitForAuth()
        },
        channels: function(Channels) {
          return Channels.$loaded()
        }
      }
    })
    .state('messages.user', {
      url: '/messages/@:user',
      controller: 'DirectCtrl',
      templateUrl: 'views/chat.html',
      resolve: {
        usernames: function(Usernames) { 
          return Usernames.$loaded()
        }
      }
    }) 
    .state('messages.channel', {
      url: '/messages/:channel',
      controller: 'ChannelCtrl',
      templateUrl: 'views/chat.html'
    })

    $urlRouterProvider.otherwise("/messages/general");
}