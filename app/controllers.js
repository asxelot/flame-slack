angular.module('FlameSlackApp')

  .controller('MainCtrl', function($scope, Auth, Users) {
    Auth.$onAuth(function(authData) {
      if (authData)
        $scope.user = Users.getProfile(authData.uid)
      else
        $scope.user = null
    })
  })

  .controller('AuthCtrl', function($scope, $location, Auth, Users) {
    $scope.newUser = {}

    function login() {
      return Auth.$authWithPassword($scope.newUser)
    }

    $scope.login = function() {
      login().then(function() {
        $location.path('/')
      })
    }

    $scope.register = function() {
      Auth.$createUser($scope.newUser)
        .then(function(authData) {
          var profile = Users.getProfile(authData.uid)

          return login()
        })
        .then(function(authData) {
          profile.username = $scope.newUser.username
          profile.avatar = authData.password.profileImageURL
          profile.$save()
          $location.path('/')
        })
    }
  })

  .controller('ChannelCtrl', function($scope, $routeParams,
                              Channels, Messages) {
    $scope.msg = {}
    $scope.channels = Channels
    $scope.channel = $routeParams.channel
    $scope.messages = Messages($scope.channel)

    $scope.addMessage = function() {
      $scope.msg.author = $scope.user
      $scope.msg.channel = $scope.channel
      $scope.msg.timestamp = Firebase.ServerValue.TIMESTAMP

      $scope.messages.$add($scope.msg)
      $scope.msg = {}
    }
  })