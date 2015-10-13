angular.module('FlameSlackApp', ['ngRoute', 'firebase'])

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
        templateUrl: 'views/channel.html'
      })
  })