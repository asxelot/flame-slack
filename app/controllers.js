angular.module('FlameSlackApp')

  .controller('MainCtrl', function($scope, $rootScope, $location, Auth, Users) {
    Auth.$onAuth(function(authData) {
      if (authData) {
        $rootScope.user = Users.getProfile(authData.uid)
        Users.setOnline(authData.uid)
        $rootScope.isAdmin = Users.isAdmin(authData.uid)
      } else {
        $rootScope.user = null
        $location.path('/login')
      }
    })  

    $scope.logout = function() {
      Users.setOffline($scope.user.$id)
      Auth.$unauth()
    }      
  })

  .controller('ChannelCtrl', function($scope, $rootScope, $routeParams, $location,
                              channels, isLogged, Messages, Users, Title, FB) {
    if (!isLogged) 
      return $location.path('/login')

    if (!channels.length)
      channels.$add('general')

    // if channel exist
    if (!~channels.map(function(c) {return c.$value}).indexOf($routeParams.channel)) 
      return $location.path('/channels/' + channels[0].$value)

    $scope.channel = $routeParams.channel
    $scope.isNewChannelFormHidden = true
    $scope.msg = {}
    $scope.channels = channels
    $rootScope.users = Users.all
    $scope.divider = $scope.user.lastReaded && $scope.user.lastReaded[$scope.channel]
    
    Title.set($scope.channel)

    if (!$scope.messages) {
      $rootScope.messages = {}

      channels.forEach(function(ch) {
        var channel = ch.$value
        $scope.messages[channel] = Messages(channel)
      })
    }

    // if new channel created
    $scope.channels.$watch(function(val) {
      var channel = $scope.channels.$getRecord(val.key).$value
      $scope.messages[channel] = Messages(channel)
    })  

    // last readed messages
    $scope.$watchCollection('messages.' + $scope.channel, function(msgs) {
      $scope.user.lastReaded = $scope.user.lastReaded || {}
      $scope.user.lastReaded[$scope.channel] = msgs.length && msgs[msgs.length-1].$id
      $scope.user.$save()
    })

    // new message
    new Firebase(FB + 'messages/').on('child_changed', function() {
      if (!$scope.isTabActive) Title.add('* ')
    })

    // mention
    $scope.$on('mention', function() {
      if (!$scope.isTabActive) Title.add('! ')
    })

    $scope.$on('tab-active', function(e, active) {
      if (active) {
        Title.remove()
      }
    })

    $scope.addMessage = function() {
      if (!$scope.msg.text) return 

      $scope.msg.channel = $scope.channel
      $scope.msg.timestamp = Firebase.ServerValue.TIMESTAMP
      $scope.msg.author = {
        id: $scope.user.$id,
        username: $scope.user.username,
        avatar: $scope.user.avatar
      }

      $scope.messages[$scope.channel].$add($scope.msg)
      $scope.msg = {}
    }

    $scope.remove = function(msg) {
      $scope.messages[$scope.channel].$remove(msg)
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

