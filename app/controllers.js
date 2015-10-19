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

    $scope.logout = function() {
      Users.setOffline($scope.user.$id)
      Auth.$unauth()
    }      
  })

  .controller('ChannelCtrl', function($scope, $rootScope, $routeParams, $location,
                              channels, isLogged, Messages, Users) {
    if (!isLogged) 
      return $location.path('/login')

    // if channel exist
    if (!~channels.map(function(c) {return c.$value}).indexOf($routeParams.channel)) 
      return $location.path('/channels/' + channels[0].$value)

    $scope.channel = $routeParams.channel
    $rootScope.title = $scope.channel + ' | Flame Slack'
    $scope.isNewChannelFormHidden = true
    $scope.msg = {}
    $scope.channels = channels
    $scope.users = Users.all
    $scope.divider = $scope.user.lastReaded[$scope.channel]

    if (!$scope.messages) {
      $rootScope.messages = {}

      channels.forEach(function(ch) {
        var channel = ch.$value
        $scope.messages[channel] = Messages(channel)
      })
    }

    $scope.$watchCollection('messages.' + $scope.channel, function(msgs) {
      $scope.user.lastReaded = $scope.user.lastReaded || {}
      $scope.user.lastReaded[$scope.channel] = msgs.length && msgs[msgs.length-1].$id
      $scope.user.$save()
    })

    $scope.addMessage = function() {
      if (!$scope.msg.text) return 

      $scope.msg.author = $scope.user
      $scope.msg.author.id = $scope.user.$id
      $scope.msg.channel = $scope.channel
      $scope.msg.timestamp = Firebase.ServerValue.TIMESTAMP

      $scope.messages[$scope.channel].$add($scope.msg)
      $scope.msg = {}
    }

    $scope.createChannel = function() {
      if ($scope.newChannelForm.$invalid) return
        
      $scope.channels.$add($scope.newChannelName)
      $scope.messages[$scope.newChannelName] = Messages($scope.newChannelName)
      $scope.newChannelName = ''
      $scope.isNewChannelFormHidden = true
    }
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
          $location.path('/channels')
        })
    }

    $scope.login = function() {
      Auth.$authWithPassword($scope.newUser)
        .then(function(authData) {
          Users.setOnline(authData.uid)
          $location.path('/channels')
        })
        .catch(console.error)
    }
  })

