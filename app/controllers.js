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

    $scope.login = function() {
      Auth.$authWithPassword($scope.newUser)
        .then(function() {
          $location.path('/')
        })
    }

    $scope.register = function() {
      Auth.$createUser($scope.newUser)
        .then(function(authData) {

          return Auth.$authWithPassword($scope.newUser)
        })
        .then(function(authData) {
          var profile = Users.getProfile(authData.uid)

          profile.username = $scope.newUser.username
          profile.avatar = authData.password.profileImageURL
          profile.isAdmin = false
          profile.isBanned = false
          profile.$save()
          $location.path('/')
        })
    }
  })

  .controller('ChannelCtrl', function($scope, $routeParams,
                              channels, Messages) {
    $scope.msg = {}
    $scope.channels = channels
    $scope.channel = $routeParams.channel
    $scope.messages = Messages($scope.channel)

    $scope.addMessage = function() {
      if (!$scope.msg.text) return 
      $scope.msg.author = $scope.user
      $scope.msg.author.id = $scope.user.$id
      $scope.msg.channel = $scope.channel
      $scope.msg.timestamp = Firebase.ServerValue.TIMESTAMP

      $scope.messages.$add($scope.msg)
      $scope.msg = {}
    }
  })