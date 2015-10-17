angular.module('FlameSlackApp')

  .controller('MainCtrl', function($scope, $location, Auth, Users) {
    Auth.$onAuth(function(authData) {
      if (authData) {
        $scope.user = Users.getProfile(authData.uid)
        Users.setOnline(authData.uid)
      } else {
        $scope.user = null
        $location.path('/login')
      }
    })   
  })

  .controller('AuthCtrl', function($scope, $location, Auth, Users) {
    $scope.newUser = {}

    $scope.register = function() {
      Auth.$createUser($scope.newUser)
        .then(function(authData) {
          return Auth.$authWithPassword($scope.newUser)
        })
        .then(function(authData) {
          Users.setOnline(authData.uid)
          var profile = Users.getProfile(authData.uid)

          profile.username = $scope.newUser.username
          profile.avatar = authData.password.profileImageURL
          profile.isAdmin = false
          profile.isBanned = false
          profile.$save()
          Users.all.$save()
          $location.path('/channels/js')
        })
    }

    $scope.login = function() {
      Auth.$authWithPassword($scope.newUser)
        .then(function(authData) {
          Users.setOnline(authData.uid)
          $location.path('/channels/js')
        })
        .catch(console.error)
    }
  })

  .controller('ChannelCtrl', function($scope, $rootScope, $routeParams, $location,
                              channels, isLogged, Messages, Users) {
    if (!isLogged) $location.path('/login')

    if (!~channels.map(function(e) {return e.$value}).indexOf($routeParams.channel))
      $location.path('/channels/' + channels[0].$value)

    $scope.isNewChannelFormHidden = true
    $scope.msg = {}
    $scope.channels = channels
    $scope.channel = $routeParams.channel
    $scope.messages = Messages($scope.channel)
    $scope.users = Users.all
    $rootScope.title = $scope.channel + ' | Flame Slack'

    $scope.logout = function() {
      Users.setOffline($scope.user.$id)
      Auth.$unauth()
    } 
    
    $scope.addMessage = function() {
      if (!$scope.msg.text) return 

      $scope.msg.author = $scope.user
      $scope.msg.author.id = $scope.user.$id
      $scope.msg.channel = $scope.channel
      $scope.msg.timestamp = Firebase.ServerValue.TIMESTAMP

      $scope.messages.$add($scope.msg)
      $scope.msg = {}
    }

    $scope.createChannel = function() {
      if ($scope.newChannelForm.$invalid) return
        
      $scope.channels.$add($scope.newChannelName)
      $scope.newChannelName = ''
      $scope.isNewChannelFormHidden = true
    }
  })